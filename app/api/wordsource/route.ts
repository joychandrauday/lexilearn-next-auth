import { NextResponse, NextRequest } from 'next/server';
import { connectDb } from '../../../lib/db';
import BengaliWordSource from '../../../lib/models/BengaliWordsOrigin';

function escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const { searchParams } = req.nextUrl;

        // Special route to get filter/select options
        if (searchParams.has('getOptions')) {
            const languages = await BengaliWordSource.distinct('sourceLanguage')
                .then(res => res.filter(Boolean).sort());
            const exams = await BengaliWordSource.distinct('exam')
                .then(res => [...new Set(res.flat())].filter(Boolean).sort());

            return NextResponse.json({ languages, exams });
        }

        // Main data query
        const search = searchParams.get('search')?.trim();
        const sourceLanguage = searchParams.get('sourceLanguage')?.trim();
        const examsParam = searchParams.get('exams');
        const exams = examsParam ? examsParam.split(',').map(e => e.trim()).filter(Boolean) : [];

        const sortField = searchParams.get('sortField') || 'createdAt';
        const sortDir = searchParams.get('sortDir') === '1' ? 1 : -1;
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '10')));

        const query: any = {};

        if (search) {
            const escaped = escapeRegex(search);
            query.$or = [
                { banglaWord: { $regex: escaped } },                    // No 'i' → works with Bengali
                { module: { $regex: escaped } },
                { userEmail: { $regex: escaped, $options: 'i' } },     // Email can stay case-insensitive
            ];
        }

        if (sourceLanguage) {
            query.sourceLanguage = sourceLanguage;
        }

        if (exams.length > 0) {
            query.exam = { $in: exams };
        }

        const total = await BengaliWordSource.countDocuments(query);

        const words = await BengaliWordSource.find(query)
            .sort({ [sortField]: sortDir })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({ words, total });
    } catch (error) {
        console.error('GET /api/wordsource error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await connectDb();

    try {
        const data = await req.json();

        // Optional: validate required fields
        if (!data.banglaWord || !data.sourceLanguage) {
            return NextResponse.json(
                { error: "Missing required fields: 'word' and 'meaning'" },
                { status: 400 }
            );
        }

        const newWord = await BengaliWordSource.create(data);

        return NextResponse.json(newWord, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/wordsource error:", error);

        // Handle JSON parse errors specifically
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        // Duplicate key error (E11000)
        if (error.code === 11000) {
            return NextResponse.json(
                { error: `Word "${error.keyValue.banglaWord}" already exists` },
                { status: 400 }
            );
        }

        // Default fallback
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
