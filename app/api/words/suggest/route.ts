import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query) return NextResponse.json([]);

    try {
        // Using Datamuse API for word suggestions
        const res = await axios.get('https://api.datamuse.com/sug', {
            params: { s: query, max: 10 },
        });

        // Datamuse returns [{ word, score }]
        const suggestions = res.data.map((item: any) => item.word);

        return NextResponse.json(suggestions);
    } catch (err) {
        console.error(err);
        return NextResponse.json([], { status: 500 });
    }
}
