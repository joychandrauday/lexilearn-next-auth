import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../../lib/db';
import BengaliWordSource from '../../../../../lib/models/BengaliWordsOrigin';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ sourceLanguage: string }> }
) {
    try {
        await connectDb();

        // ✅ MUST await params
        const { sourceLanguage } = await context.params;

        const decodedLanguage = decodeURIComponent(sourceLanguage).trim();

        if (!decodedLanguage) {
            return NextResponse.json(
                { error: 'Source language is required' },
                { status: 400 }
            );
        }

        const words = await BengaliWordSource.find({
            sourceLanguage: decodedLanguage,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            sourceLanguage: decodedLanguage,
            total: words.length,
            words,
        });
    } catch (error) {
        console.error('GET by sourceLanguage error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}
