import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDb } from '../../../../../lib/db';
import FocusTopic from '../../../../../lib/models/FocusTopic';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    let topic;
    if (mongoose.Types.ObjectId.isValid(id)) {
      topic = await FocusTopic.findById(id).lean();
    }
    if (!topic && !isNaN(Number(id))) {
      topic = await FocusTopic.findOne({ topicNumber: Number(id) }).lean();
    }

    if (!topic) {
      return NextResponse.json({ success: false, error: 'টপিক পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ success: true, topic });
  } catch (error: any) {
    console.error('GET /api/admin/focus-writing/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await req.json();

    let topic;
    if (mongoose.Types.ObjectId.isValid(id)) {
      topic = await FocusTopic.findById(id);
    }
    if (!topic && !isNaN(Number(id))) {
      topic = await FocusTopic.findOne({ topicNumber: Number(id) });
    }

    if (!topic) {
      return NextResponse.json({ success: false, error: 'টপিক পাওয়া যায়নি' }, { status: 404 });
    }

    // Editable fields
    if (body.title !== undefined) topic.title = body.title.trim();
    if (body.titleBn !== undefined) topic.titleBn = body.titleBn.trim();
    if (body.language !== undefined) topic.language = body.language === 'EN' ? 'EN' : 'BN';
    if (body.category !== undefined) topic.category = body.category.trim();
    if (body.targetExams !== undefined) topic.targetExams = body.targetExams;
    if (body.quotation !== undefined) {
      topic.quotation = {
        quote: body.quotation.quote || '',
        author: body.quotation.author || '',
        reference: body.quotation.reference || '',
      };
    }
    if (body.introduction !== undefined) topic.introduction = body.introduction;
    if (body.indicators !== undefined) topic.indicators = body.indicators;
    if (body.prospects !== undefined) topic.prospects = body.prospects;
    if (body.challenges !== undefined) topic.challenges = body.challenges;
    if (body.recommendations !== undefined) topic.recommendations = body.recommendations;
    if (body.conclusion !== undefined) topic.conclusion = body.conclusion;
    if (body.keyVocabulary !== undefined) topic.keyVocabulary = body.keyVocabulary;
    if (body.intactMarkdown !== undefined) {
      topic.intactMarkdown = body.intactMarkdown;
      topic.fullText = body.intactMarkdown;
    }
    if (body.sourceCredit !== undefined) topic.sourceCredit = body.sourceCredit;
    if (body.curator !== undefined) topic.curator = body.curator;
    if (body.sourceUrl !== undefined) topic.sourceUrl = body.sourceUrl;

    await topic.save();

    return NextResponse.json({
      success: true,
      message: `টপিক #${topic.topicNumber} সফলভাবে আপডেট করা হয়েছে!`,
      topic,
    });
  } catch (error: any) {
    console.error('PUT /api/admin/focus-writing/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    let deleted;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await FocusTopic.findByIdAndDelete(id);
    }
    if (!deleted && !isNaN(Number(id))) {
      deleted = await FocusTopic.findOneAndDelete({ topicNumber: Number(id) });
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'টপিক পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `টপিক #${deleted.topicNumber} সফলভাবে মুছে ফেলা হয়েছে।`,
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/focus-writing/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
