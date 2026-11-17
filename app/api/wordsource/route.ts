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

        // Special route to get filter/select options & stats
        if (searchParams.has('getOptions')) {
            const languages = await BengaliWordSource.distinct('sourceLanguage')
                .then(res => res.filter(Boolean).sort());
            const exams = await BengaliWordSource.distinct('exam')
                .then(res => [...new Set(res.flat())].filter(Boolean).sort());
            const totalCount = await BengaliWordSource.countDocuments();

            return NextResponse.json({ languages, exams, totalCount });
        }

        // Main data query
        const search = searchParams.get('search')?.trim();
        const sourceLanguage = searchParams.get('sourceLanguage')?.trim();
        const examsParam = searchParams.get('exams');
        const exams = examsParam ? examsParam.split(',').map(e => e.trim()).filter(Boolean) : [];

        const sortField = searchParams.get('sortField') || 'createdAt';
        const sortDir = searchParams.get('sortDir') === '1' ? 1 : -1;
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '10')));

        const query: any = {};

        if (search) {
            const escaped = escapeRegex(search);
            query.$or = [
                { banglaWord: { $regex: escaped } },
                { sourceLanguage: { $regex: escaped } },
                { meaning: { $regex: escaped } },
                { examTags: { $in: [new RegExp(escaped, 'i')] } },
            ];
        }

        if (sourceLanguage && sourceLanguage !== 'all') {
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

        return NextResponse.json({ words, total, page, limit });
    } catch (error) {
        console.error('GET /api/wordsource error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await connectDb();

    try {
        const data = await req.json();

        const banglaWord = data.banglaWord?.trim();
        const sourceLanguage = Array.isArray(data.sourceLanguage)
            ? data.sourceLanguage[0]?.trim()
            : data.sourceLanguage?.trim();

        if (!banglaWord || !sourceLanguage) {
            return NextResponse.json(
                { error: "অনুগ্রহ করে বাংলা শব্দ এবং উৎস ভাষা উভয়ই প্রদান করুন (বাংলা শব্দ ও উৎস ভাষা আবশ্যক)" },
                { status: 400 }
            );
        }

        const userEmail = data.userEmail?.trim() || 'community@lexilearn.com';
        const examList = Array.isArray(data.exam) && data.exam.length > 0 ? data.exam : ['others'];
        const examTag = data.examTag?.trim();
        const meaning = data.meaning?.trim() || '';

        // Check if word already exists -> update/merge exams and examTags
        const existingWord = await BengaliWordSource.findOne({ banglaWord });
        if (existingWord) {
            const currentExams = Array.isArray(existingWord.exam) ? existingWord.exam : [];
            const mergedExams = Array.from(new Set([...currentExams, ...examList]));

            const currentTags = Array.isArray(existingWord.examTags) ? existingWord.examTags : [];
            if (examTag && !currentTags.includes(examTag)) {
                currentTags.push(examTag);
            }

            existingWord.exam = mergedExams as any;
            existingWord.examTags = currentTags;
            if (meaning && !existingWord.meaning) {
                existingWord.meaning = meaning;
            }
            existingWord.frequencyCount = (existingWord.frequencyCount || 1) + 1;
            await existingWord.save();

            return NextResponse.json({
                success: true,
                reused: true,
                word: existingWord,
                message: `"${banglaWord}" শব্দটি পূর্বে সংরক্ষিত ছিল। আপনার পরীক্ষার ট্যাগ ও তথ্য আপডেট করা হয়েছে!`,
            }, { status: 200 });
        }

        const newWord = await BengaliWordSource.create({
            banglaWord,
            sourceLanguage,
            meaning,
            userEmail,
            exam: examList,
            examTags: examTag ? [examTag] : [],
            frequencyCount: 1,
        });

        return NextResponse.json({
            success: true,
            reused: false,
            word: newWord,
            message: `"${banglaWord}" সফলভাবে বাংলা শব্দকোষে যুক্ত হয়েছে!`,
        }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/wordsource error:", error);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        if (error.code === 11000) {
            return NextResponse.json(
                { error: `"${error.keyValue?.banglaWord || 'শব্দটি'}" ইতিমধ্যে সংরক্ষিত রয়েছে` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || "শব্দ সংরক্ষণে সমস্যা হয়েছে" },
            { status: 500 }
        );
    }
}
