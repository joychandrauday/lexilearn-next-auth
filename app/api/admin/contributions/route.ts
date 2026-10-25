import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import FeedPost from '../../../../lib/models/FeedPost';
import Word from '../../../../lib/models/Word';
import UserProfile from '../../../../lib/models/UserProfile';

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending'; // 'pending' | 'approved' | 'rejected' | 'all'
    const type = searchParams.get('type') || 'all'; // 'all' | 'feed_post' | 'word' | 'exam_tag'
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    // 1. Calculate live pending badge counts
    const [pendingFeedCount, pendingWordCount, wordsWithPendingTags] = await Promise.all([
      FeedPost.countDocuments({ status: 'pending' }),
      Word.countDocuments({ status: 'pending' }),
      Word.find({
        pendingExamTags: { $exists: true, $ne: [] },
      })
        .select('pendingExamTags')
        .lean(),
    ]);

    const pendingTagCount = wordsWithPendingTags.reduce(
      (acc, w: any) => acc + (w.pendingExamTags?.length || 0),
      0
    );

    const counts = {
      feedPosts: pendingFeedCount,
      words: pendingWordCount,
      examTags: pendingTagCount,
      total: pendingFeedCount + pendingWordCount + pendingTagCount,
    };

    const items: any[] = [];

    // 2. Fetch FeedPosts if requested
    if (type === 'all' || type === 'feed_post') {
      const feedQuery: any = {};
      if (status !== 'all') {
        feedQuery.status = status;
      }
      if (search) {
        feedQuery.$or = [
          { title: { $regex: search, $options: 'i' } },
          { 'author.name': { $regex: search, $options: 'i' } },
          { 'author.email': { $regex: search, $options: 'i' } },
          { 'vocabData.word': { $regex: search, $options: 'i' } },
        ];
      }

      const feedPosts = await FeedPost.find(feedQuery)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      feedPosts.forEach((post: any) => {
        let xp = 30;
        if (post.type === 'vocab_card') xp = 50;
        else if (post.type === 'user_progress') xp = 40;
        else if (post.type === 'exam_mcq') xp = 35;

        items.push({
          id: post._id.toString(),
          type: 'feed_post',
          status: post.status || 'pending',
          title: post.title,
          subtitle:
            post.type === 'vocab_card'
              ? `ভোকাবুলারি: ${post.vocabData?.word || ''} (${post.vocabData?.bangla || ''})`
              : post.type === 'exam_mcq'
              ? `MCQ: ${post.mcqData?.question || ''}`
              : `ক্যাটাগরি: ${post.category?.toUpperCase() || ''}`,
          contributor: {
            name: post.author?.name || 'নাম নেই',
            email: post.author?.email || '',
            role: post.author?.role || 'user',
          },
          details: {
            category: post.category,
            postType: post.type,
            content: post.content,
            vocabData: post.vocabData,
            mcqData: post.mcqData,
            progressData: post.progressData,
          },
          xpReward: xp,
          rejectionReason: post.rejectionReason,
          createdAt: post.createdAt,
        });
      });
    }

    // 3. Fetch Words if requested
    if (type === 'all' || type === 'word') {
      const wordQuery: any = {};
      if (status !== 'all') {
        wordQuery.status = status;
      }
      if (search) {
        wordQuery.$or = [
          { word: { $regex: search, $options: 'i' } },
          { bangla: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { contributedBy: { $regex: search, $options: 'i' } },
        ];
      }

      const words = await Word.find(wordQuery)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      words.forEach((w: any) => {
        items.push({
          id: w._id.toString(),
          type: 'word',
          status: w.status || 'approved',
          title: `${w.word.toUpperCase()} • ${w.bangla || ''}`,
          subtitle: `অর্থ: ${w.meaning || 'দেওয়া হয়নি'} | পরীক্ষা: ${w.exam || 'bcs'}`,
          contributor: {
            name: w.contributedBy || w.userEmail?.split('@')[0] || 'কমিউনিটি ইউজার',
            email: w.userEmail || '',
            role: 'user',
          },
          details: {
            word: w.word,
            bangla: w.bangla,
            meaning: w.meaning,
            mnemonic: w.mnemonic,
            examTags: w.examTags,
            partOfSpeech: w.partOfSpeech,
            example: w.example,
          },
          xpReward: 50,
          rejectionReason: w.rejectionReason,
          createdAt: w.createdAt,
        });
      });
    }

    // 4. Fetch Pending Exam Tags on Words
    if (type === 'all' || type === 'exam_tag') {
      if (status === 'pending' || status === 'all') {
        const wordsWithTags = await Word.find({
          pendingExamTags: { $exists: true, $ne: [] },
        })
          .select('word bangla pendingExamTags')
          .lean();

        wordsWithTags.forEach((w: any) => {
          (w.pendingExamTags || []).forEach((pt: any, idx: number) => {
            if (
              !search ||
              w.word.toLowerCase().includes(search) ||
              pt.tag?.toLowerCase().includes(search) ||
              pt.submittedBy?.toLowerCase().includes(search)
            ) {
              items.push({
                id: `${w._id.toString()}__tag__${encodeURIComponent(pt.tag)}`,
                wordId: w._id.toString(),
                type: 'exam_tag',
                status: 'pending',
                title: `পরীক্ষার ট্যাগ: "${pt.tag}"`,
                subtitle: `শব্দ: ${w.word?.toUpperCase()} (${w.bangla || ''})`,
                contributor: {
                  name: pt.submittedByName || pt.submittedBy?.split('@')[0] || 'ইউজার',
                  email: pt.submittedBy || '',
                  role: 'user',
                },
                details: {
                  word: w.word,
                  bangla: w.bangla,
                  examTag: pt.tag,
                },
                xpReward: 50,
                createdAt: pt.createdAt || new Date(),
              });
            }
          });
        });
      }
    }

    // Sort combined feed by createdAt descending
    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      counts,
      total: items.length,
      items,
    });
  } catch (error: any) {
    console.error('GET /api/admin/contributions error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { id, type, action, tag, userEmail, rejectionReason } = body;

    if (!id || !type || !action) {
      return NextResponse.json(
        { error: 'id, type এবং action আবশ্যক' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'অ্যাকশন শুধুমাত্র approve অথবা reject হতে পারবে' },
        { status: 400 }
      );
    }

    // 1. APPROVE / REJECT FEED POST
    if (type === 'feed_post') {
      const post = await FeedPost.findById(id);
      if (!post) {
        return NextResponse.json({ error: 'পোস্টটি পাওয়া যায়নি' }, { status: 404 });
      }

      if (action === 'approve') {
        post.status = 'approved';
        await post.save();

        let xp = 30;
        if (post.type === 'vocab_card') xp = 50;
        else if (post.type === 'user_progress') xp = 40;
        else if (post.type === 'exam_mcq') xp = 35;

        // Award XP to author
        if (post.author?.email) {
          const authorEmail = post.author.email.toLowerCase().trim();
          await UserProfile.findOneAndUpdate(
            { email: authorEmail },
            {
              $inc: { contributionPoints: xp, contributionsCount: 1 },
              $addToSet: {
                badges:
                  post.type === 'vocab_card'
                    ? 'ভোকাব হিরো'
                    : post.type === 'exam_mcq'
                    ? 'কুইজ মাস্টার'
                    : 'কমিউনিটি মেন্টর',
              },
            },
            { upsert: true }
          );
        }

        // If vocabData attached, approve word in Word collection too
        if (post.vocabData?.word) {
          await Word.updateOne(
            { word: post.vocabData.word.toLowerCase().trim() },
            {
              $set: {
                status: 'approved',
                verificationStatus: 'verified',
                verificationScore: 92,
              },
            }
          );
        }

        return NextResponse.json({
          success: true,
          message: `পোস্টটি অনুমোদিত হয়েছে এবং লেখকের একাউন্টে +${xp} XP যোগ হয়েছে!`,
          item: post,
        });
      } else {
        post.status = 'rejected';
        post.rejectionReason = rejectionReason || 'অ্যাডমিন পর্যালোচনায় বাতিল করা হয়েছে';
        await post.save();

        return NextResponse.json({
          success: true,
          message: 'পোস্টটি প্রত্যাখ্যান করা হয়েছে।',
          item: post,
        });
      }
    }

    // 2. APPROVE / REJECT WORD
    if (type === 'word') {
      const word = await Word.findById(id);
      if (!word) {
        return NextResponse.json({ error: 'শব্দটি পাওয়া যায়নি' }, { status: 404 });
      }

      if (action === 'approve') {
        word.status = 'approved';
        word.verificationStatus = 'verified';
        word.verificationScore = Math.max(word.verificationScore || 85, 92);
        word.verifiedBy = 'অ্যাডমিন প্যানেল ভেরিফাইড';
        await word.save();

        // Award +50 XP
        if (word.userEmail) {
          const authorEmail = word.userEmail.toLowerCase().trim();
          await UserProfile.findOneAndUpdate(
            { email: authorEmail },
            {
              $inc: { contributionPoints: 50, contributionsCount: 1 },
              $addToSet: { badges: 'ভোকাব হিরো' },
            },
            { upsert: true }
          );
        }

        return NextResponse.json({
          success: true,
          message: `"${word.word}" শব্দটি সফলভাবে অনুমোদিত হয়েছে এবং ইউজারের একাউন্টে +৫০ XP যোগ করা হয়েছে!`,
          item: word,
        });
      } else {
        word.status = 'rejected';
        word.rejectionReason = rejectionReason || 'অ্যাডমিন পর্যালোচনায় বাতিল করা হয়েছে';
        await word.save();

        return NextResponse.json({
          success: true,
          message: `"${word.word}" শব্দটি প্রত্যাখ্যান করা হয়েছে।`,
          item: word,
        });
      }
    }

    // 3. APPROVE / REJECT EXAM TAG
    if (type === 'exam_tag') {
      let targetWordId = id;
      let targetTag = tag;

      if (id.includes('__tag__')) {
        const parts = id.split('__tag__');
        targetWordId = parts[0];
        targetTag = decodeURIComponent(parts[1]);
      }

      const word = await Word.findById(targetWordId);
      if (!word) {
        return NextResponse.json({ error: 'শব্দটি পাওয়া যায়নি' }, { status: 404 });
      }

      // Find tag submission details from pendingExamTags
      const pendingList = Array.isArray(word.pendingExamTags) ? word.pendingExamTags : [];
      const matchTag = pendingList.find(
        (p: any) => p.tag?.toLowerCase() === targetTag?.toLowerCase()
      );

      const contributorEmail = matchTag?.submittedBy || userEmail;

      if (action === 'approve') {
        const existingTags = Array.isArray(word.examTags) ? word.examTags : [];
        if (!existingTags.some((t) => t.toLowerCase() === targetTag.toLowerCase())) {
          existingTags.push(targetTag);
        }

        word.examTags = existingTags;
        word.frequencyCount = Math.max(existingTags.length, (word.frequencyCount || 1) + 1);
        word.isMostRepeated = word.frequencyCount >= 2;
        word.verificationScore = Math.min(100, (word.verificationScore || 85) + 3);

        // Remove from pendingExamTags
        word.pendingExamTags = pendingList.filter(
          (p: any) => p.tag?.toLowerCase() !== targetTag?.toLowerCase()
        );

        await word.save();

        // Award +50 XP to contributor
        if (contributorEmail) {
          const authorEmail = contributorEmail.toLowerCase().trim();
          await UserProfile.findOneAndUpdate(
            { email: authorEmail },
            {
              $inc: { contributionPoints: 50, contributionsCount: 1, examTagsCount: 1 },
              $addToSet: { badges: 'ট্যাগ স্পেশালিস্ট' },
            },
            { upsert: true }
          );
        }

        return NextResponse.json({
          success: true,
          message: `"${targetTag}" পরীক্ষার ট্যাগ সফলভাবে অনুমোদিত হয়েছে এবং কন্ট্রিবিউটরকে +৫০ XP যোগ করা হয়েছে!`,
          item: word,
        });
      } else {
        // Reject: remove from pendingExamTags
        word.pendingExamTags = pendingList.filter(
          (p: any) => p.tag?.toLowerCase() !== targetTag?.toLowerCase()
        );
        await word.save();

        return NextResponse.json({
          success: true,
          message: `"${targetTag}" পরীক্ষার ট্যাগটি বাতিল করা হয়েছে।`,
          item: word,
        });
      }
    }

    return NextResponse.json({ error: 'অজানা কন্ট্রিবিউশন টাইপ' }, { status: 400 });
  } catch (error: any) {
    console.error('PATCH /api/admin/contributions error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
