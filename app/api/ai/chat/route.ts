import { NextRequest, NextResponse } from 'next/server';
import { chatWithAIMentor, ChatMessage } from '../../../../lib/ai';
import { connectDb } from '../../../../lib/db';
import SubscriberLead from '../../../../lib/models/SubscriberLead';
import UserProfile from '../../../../lib/models/UserProfile';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userEmail } = body as {
      messages: ChatMessage[];
      userEmail?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'মেসেজ তালিকা প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }

    // Inspect user messages for Email and Phone numbers to capture lead
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const emailMatch = lastUserMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    const phoneMatch = lastUserMessage.match(/(?:\+?880|0)1[3-9]\d{8}/);

    let capturedContact: { email?: string; phone?: string } | null = null;

    if (emailMatch || phoneMatch || userEmail) {
      try {
        await connectDb();
        const detectedEmail = emailMatch ? emailMatch[0].toLowerCase() : userEmail?.toLowerCase();
        const detectedPhone = phoneMatch ? phoneMatch[0] : undefined;

        if (detectedEmail) {
          await SubscriberLead.findOneAndUpdate(
            { email: detectedEmail },
            {
              $set: {
                ...(detectedPhone ? { phone: detectedPhone } : {}),
                source: 'ai_chatbot',
                updatedAt: new Date(),
              },
              $setOnInsert: {
                email: detectedEmail,
                targetExam: 'bcs',
                createdAt: new Date(),
              },
            },
            { upsert: true, new: true }
          );

          // Update UserProfile if available
          if (detectedPhone) {
            await UserProfile.findOneAndUpdate(
              { email: detectedEmail },
              { $set: { phone: detectedPhone } }
            );
          }

          capturedContact = { email: detectedEmail, phone: detectedPhone };
        } else if (detectedPhone) {
          // If only phone provided without prior email
          capturedContact = { phone: detectedPhone };
        }
      } catch (leadErr) {
        console.warn('Error capturing chatbot contact lead:', leadErr);
      }
    }

    const reply = await chatWithAIMentor(messages, {
      userEmail: userEmail || capturedContact?.email,
    });

    return NextResponse.json({
      success: true,
      reply,
      capturedContact,
    });
  } catch (error: any) {
    console.error('POST /api/ai/chat error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'AI মেন্টরের সাথে যোগাযোগে ত্রুটি হয়েছে',
      },
      { status: 500 }
    );
  }
}
