import { NextRequest, NextResponse } from 'next/server';
import { chatWithAIMentor, ChatMessage } from '../../../../lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'মেসেজ তালিকা প্রদান করা আবশ্যক' },
        { status: 400 }
      );
    }

    const reply = await chatWithAIMentor(messages);

    return NextResponse.json({
      success: true,
      reply,
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
