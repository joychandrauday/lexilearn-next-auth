import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDb } from '../../../../../lib/db';
import { EconomicStat } from '../../../../../lib/models/EconomicStat';

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

    let stat;
    if (mongoose.Types.ObjectId.isValid(id)) {
      stat = await EconomicStat.findById(id).lean();
    }
    if (!stat) {
      stat = await EconomicStat.findOne({ indicatorKey: id.toUpperCase() }).lean();
    }

    if (!stat) {
      return NextResponse.json({ success: false, error: 'ইনডিকেটর পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ success: true, stat });
  } catch (error: any) {
    console.error('GET /api/admin/economic-stats/[id] error:', error);
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

    let stat;
    if (mongoose.Types.ObjectId.isValid(id)) {
      stat = await EconomicStat.findById(id);
    }
    if (!stat) {
      stat = await EconomicStat.findOne({ indicatorKey: id.toUpperCase() });
    }

    if (!stat) {
      return NextResponse.json({ success: false, error: 'ইনডিকেটর পাওয়া যায়নি' }, { status: 404 });
    }

    // Editable fields
    if (body.titleEn !== undefined) stat.titleEn = body.titleEn.trim();
    if (body.titleBn !== undefined) stat.titleBn = body.titleBn.trim();
    if (body.benchmarkData !== undefined) stat.benchmarkData = body.benchmarkData.trim();
    if (body.benchmarkDataBn !== undefined) stat.benchmarkDataBn = body.benchmarkDataBn.trim();
    if (body.timeframe !== undefined) stat.timeframe = body.timeframe.trim();
    if (body.timeframeBn !== undefined) stat.timeframeBn = body.timeframeBn.trim();
    if (body.source !== undefined) stat.source = body.source.trim();
    if (body.sourceUrl !== undefined) stat.sourceUrl = body.sourceUrl.trim();
    if (body.category !== undefined) stat.category = body.category;
    if (body.examRelevance !== undefined) stat.examRelevance = body.examRelevance;
    if (body.historicalTrajectory !== undefined) stat.historicalTrajectory = body.historicalTrajectory;
    if (body.historicalTrajectoryBn !== undefined) stat.historicalTrajectoryBn = body.historicalTrajectoryBn;
    if (body.examTip !== undefined) stat.examTip = body.examTip;
    if (body.examTipBn !== undefined) stat.examTipBn = body.examTipBn;
    if (body.relatedTopicNumbers !== undefined) stat.relatedTopicNumbers = body.relatedTopicNumbers;
    if (body.tags !== undefined) stat.tags = body.tags;
    if (body.isVerified !== undefined) stat.isVerified = Boolean(body.isVerified);
    if (body.order !== undefined) stat.order = Number(body.order);

    await stat.save();

    return NextResponse.json({
      success: true,
      message: `ইনডিকেটর '${stat.indicatorKey}' সফলভাবে আপডেট হয়েছে!`,
      stat,
    });
  } catch (error: any) {
    console.error('PUT /api/admin/economic-stats/[id] error:', error);
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
      deleted = await EconomicStat.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await EconomicStat.findOneAndDelete({ indicatorKey: id.toUpperCase() });
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'ইনডিকেটর পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `ইনডিকেটর '${deleted.indicatorKey}' সফলভাবে মুছে ফেলা হয়েছে।`,
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/economic-stats/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
