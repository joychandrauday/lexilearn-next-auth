import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import QuizDuel, { IQuizDuel } from '../../../lib/models/QuizDuel';
import UserProfile from '../../../lib/models/UserProfile';
import MistakeVault from '../../../lib/models/MistakeVault';
import { getRandomDuelQuestions } from '../../../lib/duel-questions';

const AI_OPPONENTS = [
  { name: 'Ashiq (45th BCS Aspirant)', rating: 1240 },
  { name: 'Nusrat (Bangladesh Bank AD Aspirant)', rating: 1290 },
  { name: 'Tanvir (Combined Banks Aspirant)', rating: 1210 },
  { name: 'Fahim (47th BCS Aspirant)', rating: 1270 },
  { name: 'Sadia (NTRCA Top Ranker)', rating: 1230 },
];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const roomCode = searchParams.get('roomCode')?.toUpperCase().trim();

    if (action === 'leaderboard') {
      const topDuelists = await UserProfile.find({
        $or: [{ duelWins: { $gt: 0 } }, { duelLosses: { $gt: 0 } }],
      })
        .sort({ duelRating: -1, duelWins: -1 })
        .limit(20)
        .select('name email duelWins duelLosses duelDraws duelRating badges image contributionPoints')
        .lean();

      return NextResponse.json({
        success: true,
        leaderboard: topDuelists.map((d: any, index: number) => {
          const totalMatches = (d.duelWins || 0) + (d.duelLosses || 0) + (d.duelDraws || 0);
          const winRate = totalMatches > 0 ? Math.round(((d.duelWins || 0) / totalMatches) * 100) : 0;
          return {
            rank: index + 1,
            name: d.name || d.email.split('@')[0],
            email: d.email,
            image: d.image || '',
            duelWins: d.duelWins || 0,
            duelLosses: d.duelLosses || 0,
            duelDraws: d.duelDraws || 0,
            duelRating: d.duelRating || 1200,
            winRate,
            badges: d.badges || [],
            xp: d.contributionPoints || 0,
          };
        }),
      });
    }

    if (roomCode) {
      const duel = await QuizDuel.findOne({ roomCode });
      if (!duel) {
        return NextResponse.json(
          { success: false, error: 'Duel room not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        duel,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('GET /api/battle error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { action, roomCode, userEmail, userName, userImage, subject, questionIndex, selectedOption, timeSpentSeconds, questionData } = body;

    const cleanEmail = (userEmail || '').trim().toLowerCase();
    const cleanName = (userName || '').trim() || cleanEmail.split('@')[0] || 'Aspirant';

    // 1. CREATE ROOM
    if (action === 'create') {
      if (!cleanEmail) {
        return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      let generatedCode = generateRoomCode();
      // Ensure unique code
      while (await QuizDuel.findOne({ roomCode: generatedCode })) {
        generatedCode = generateRoomCode();
      }

      const questions = await getRandomDuelQuestions(5, subject);

      const duel = await QuizDuel.create({
        roomCode: generatedCode,
        challenger: {
          email: cleanEmail,
          name: cleanName,
          image: userImage || '',
          score: 0,
          isReady: true,
          isFinished: false,
          answers: [],
        },
        opponent: null,
        isBotOpponent: false,
        status: 'waiting',
        subject: subject || 'all',
        questions,
      });

      return NextResponse.json({
        success: true,
        duel,
        message: 'Duel room created! Share the room code with your rival.',
      });
    }

    // 2. JOIN ROOM
    if (action === 'join') {
      const code = (roomCode || '').toUpperCase().trim();
      if (!code || !cleanEmail) {
        return NextResponse.json(
          { success: false, error: 'Room code and email are required' },
          { status: 400 }
        );
      }

      const duel = await QuizDuel.findOne({ roomCode: code });
      if (!duel) {
        return NextResponse.json(
          { success: false, error: 'Duel room not found. Please check code.' },
          { status: 404 }
        );
      }

      if (duel.challenger.email === cleanEmail) {
        return NextResponse.json({
          success: true,
          duel,
          isOwner: true,
          message: 'Reconnected to your room.',
        });
      }

      if (duel.status !== 'waiting' && duel.opponent?.email !== cleanEmail) {
        return NextResponse.json(
          { success: false, error: 'This duel room is already full or finished.' },
          { status: 400 }
        );
      }

      if (!duel.opponent || duel.opponent.email !== cleanEmail) {
        duel.opponent = {
          email: cleanEmail,
          name: cleanName,
          image: userImage || '',
          score: 0,
          isReady: true,
          isFinished: false,
          answers: [],
        } as any;
        duel.status = 'in_progress';
        duel.startedAt = new Date();
        await duel.save();
      }

      return NextResponse.json({
        success: true,
        duel,
        message: 'Joined battle room successfully! The duel begins!',
      });
    }

    // 3. INSTANT MATCH (Live Aspirant OR Sparring Bot)
    if (action === 'match') {
      if (!cleanEmail) {
        return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      // Look for waiting rooms created in the last 2 minutes by other candidates
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const waitingDuel = await QuizDuel.findOne({
        status: 'waiting',
        'challenger.email': { $ne: cleanEmail },
        createdAt: { $gte: twoMinutesAgo },
      });

      if (waitingDuel) {
        waitingDuel.opponent = {
          email: cleanEmail,
          name: cleanName,
          image: userImage || '',
          score: 0,
          isReady: true,
          isFinished: false,
          answers: [],
        } as any;
        waitingDuel.status = 'in_progress';
        waitingDuel.startedAt = new Date();
        await waitingDuel.save();

        return NextResponse.json({
          success: true,
          duel: waitingDuel,
          isBot: false,
          message: 'Matched with live aspirant!',
        });
      }

      // If no live room, launch AI Sparring Match
      const randomAI = AI_OPPONENTS[Math.floor(Math.random() * AI_OPPONENTS.length)];
      const generatedCode = generateRoomCode();
      const questions = await getRandomDuelQuestions(5, subject);

      const botDuel = await QuizDuel.create({
        roomCode: generatedCode,
        challenger: {
          email: cleanEmail,
          name: cleanName,
          image: userImage || '',
          score: 0,
          isReady: true,
          isFinished: false,
          answers: [],
        },
        opponent: {
          email: 'bot@lexilearn.ai',
          name: randomAI.name,
          image: '',
          score: 0,
          isReady: true,
          isFinished: false,
          answers: [],
        },
        isBotOpponent: true,
        status: 'in_progress',
        subject: subject || 'all',
        questions,
        startedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        duel: botDuel,
        isBot: true,
        message: `Matched with sparring partner: ${randomAI.name}`,
      });
    }

    // 4. SUBMIT ANSWER
    if (action === 'submit_answer') {
      const code = (roomCode || '').toUpperCase().trim();
      const duel = await QuizDuel.findOne({ roomCode: code });
      if (!duel) {
        return NextResponse.json(
          { success: false, error: 'Duel not found' },
          { status: 404 }
        );
      }

      const qIndex = Number(questionIndex);
      const q = duel.questions[qIndex];
      if (!q) {
        return NextResponse.json(
          { success: false, error: 'Invalid question index' },
          { status: 400 }
        );
      }

      const isCorrect = (selectedOption || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      // Scoring formula: Base 10 points + speed bonus up to 5 points (within 15s)
      const spentSec = Math.min(15, Math.max(1, Number(timeSpentSeconds) || 5));
      const speedBonus = isCorrect ? Math.max(0, Math.round(5 * (1 - spentSec / 15))) : 0;
      const pointsEarned = isCorrect ? 10 + speedBonus : 0;

      const isChallenger = duel.challenger.email === cleanEmail;
      const player = isChallenger ? duel.challenger : duel.opponent;

      if (!player) {
        return NextResponse.json(
          { success: false, error: 'Player not part of this duel' },
          { status: 403 }
        );
      }

      // Check if player already answered this question
      const existingAnswer = player.answers.find((a) => a.questionIndex === qIndex);
      if (!existingAnswer) {
        player.answers.push({
          questionIndex: qIndex,
          selectedOption,
          timeSpentSeconds: spentSec,
          isCorrect,
          pointsEarned,
        });
        player.score = (player.score || 0) + pointsEarned;
      }

      if (player.answers.length >= duel.questions.length) {
        player.isFinished = true;
      }

      // If Bot opponent, simulate Bot answer for this question
      let botAnswerDetails: any = null;
      if (duel.isBotOpponent && duel.opponent) {
        const botAlreadyAnswered = duel.opponent.answers.some((a) => a.questionIndex === qIndex);
        if (!botAlreadyAnswered) {
          // Bot has 75% accuracy
          const botIsCorrect = Math.random() < 0.75;
          const botTime = Math.floor(Math.random() * 7) + 3; // 3 to 10 seconds
          const botSpeedBonus = botIsCorrect ? Math.max(0, Math.round(5 * (1 - botTime / 15))) : 0;
          const botPoints = botIsCorrect ? 10 + botSpeedBonus : 0;
          let botChoice = q.correctAnswer;
          if (!botIsCorrect) {
            const wrongOptions = q.options.filter((o) => o !== q.correctAnswer);
            botChoice = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] || q.options[0];
          }

          duel.opponent.answers.push({
            questionIndex: qIndex,
            selectedOption: botChoice,
            timeSpentSeconds: botTime,
            isCorrect: botIsCorrect,
            pointsEarned: botPoints,
          });
          duel.opponent.score = (duel.opponent.score || 0) + botPoints;

          if (duel.opponent.answers.length >= duel.questions.length) {
            duel.opponent.isFinished = true;
          }

          botAnswerDetails = {
            selectedOption: botChoice,
            isCorrect: botIsCorrect,
            pointsEarned: botPoints,
          };
        }
      }

      // Check if both finished
      let duelFinished = false;
      let winnerEmail = '';
      if (duel.challenger.isFinished && (duel.opponent?.isFinished || duel.isBotOpponent)) {
        duelFinished = true;
        duel.status = 'completed';
        duel.completedAt = new Date();

        const cScore = duel.challenger.score || 0;
        const oScore = duel.opponent?.score || 0;

        if (cScore > oScore) {
          winnerEmail = duel.challenger.email;
        } else if (oScore > cScore) {
          winnerEmail = duel.opponent?.email || '';
        } else {
          winnerEmail = 'draw';
        }
        duel.winnerEmail = winnerEmail;

        // Update User Profiles & Ratings
        if (!duel.isBotOpponent) {
          // Human vs Human
          if (winnerEmail === duel.challenger.email) {
            await UserProfile.findOneAndUpdate(
              { email: duel.challenger.email },
              { $inc: { duelWins: 1, contributionPoints: 30, duelRating: 25 }, $addToSet: { badges: 'Duel Champion' } }
            );
            if (duel.opponent?.email) {
              await UserProfile.findOneAndUpdate(
                { email: duel.opponent.email },
                { $inc: { duelLosses: 1, contributionPoints: 10, duelRating: -10 } }
              );
            }
          } else if (winnerEmail === duel.opponent?.email) {
            await UserProfile.findOneAndUpdate(
              { email: duel.opponent.email },
              { $inc: { duelWins: 1, contributionPoints: 30, duelRating: 25 }, $addToSet: { badges: 'Duel Champion' } }
            );
            await UserProfile.findOneAndUpdate(
              { email: duel.challenger.email },
              { $inc: { duelLosses: 1, contributionPoints: 10, duelRating: -10 } }
            );
          } else {
            // Draw
            await UserProfile.findOneAndUpdate(
              { email: duel.challenger.email },
              { $inc: { duelDraws: 1, contributionPoints: 15 } }
            );
            if (duel.opponent?.email) {
              await UserProfile.findOneAndUpdate(
                { email: duel.opponent.email },
                { $inc: { duelDraws: 1, contributionPoints: 15 } }
              );
            }
          }
        } else {
          // Human vs Bot
          const userWon = winnerEmail === cleanEmail;
          const isDraw = winnerEmail === 'draw';
          const pointsDelta = userWon ? 30 : isDraw ? 15 : 10;
          const ratingDelta = userWon ? 20 : isDraw ? 5 : -10;

          await UserProfile.findOneAndUpdate(
            { email: cleanEmail },
            {
              $inc: {
                duelWins: userWon ? 1 : 0,
                duelLosses: !userWon && !isDraw ? 1 : 0,
                duelDraws: isDraw ? 1 : 0,
                contributionPoints: pointsDelta,
                duelRating: ratingDelta,
              },
              ...(userWon ? { $addToSet: { badges: 'Duel Gladiator' } } : {}),
            },
            { upsert: true }
          );
        }
      }

      await duel.save();

      return NextResponse.json({
        success: true,
        duel,
        isCorrect,
        pointsEarned,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        botAnswer: botAnswerDetails,
        duelFinished,
        winnerEmail,
      });
    }

    // 5. SAVE MISSED QUESTION TO MISTAKE VAULT
    if (action === 'save_mistake') {
      if (!cleanEmail || !questionData) {
        return NextResponse.json({ success: false, error: 'Missing details' }, { status: 400 });
      }

      await MistakeVault.create({
        userEmail: cleanEmail,
        question: questionData.questionText || questionData.question,
        options: questionData.options || [],
        userWrongAnswer: questionData.userWrongAnswer || '',
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation || '',
        subject: questionData.subject || 'General Knowledge',
        topic: questionData.topic || '',
        source: 'Quiz Duel 1-vs-1',
        mistakeCount: 1,
        resolved: false,
      });

      return NextResponse.json({
        success: true,
        message: 'Question saved to Mistake Vault for focused review!',
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/battle error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
