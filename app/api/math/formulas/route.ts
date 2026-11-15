import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import MathFormulaVault from '../../../../lib/models/MathFormulaVault';
import { seedMathIfEmpty } from '../../../../lib/math/math-seeder';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    await seedMathIfEmpty();

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get('stream') || 'bank';
    const topic = searchParams.get('topic');

    const query: any = {};
    if (stream !== 'all') {
      query.stream = stream;
    }
    if (topic && topic !== 'all') {
      query.topic = topic;
    }

    const vaults = await MathFormulaVault.find(query).lean();

    return NextResponse.json({
      success: true,
      vaults,
    });
  } catch (error: any) {
    console.error('GET /api/math/formulas error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
