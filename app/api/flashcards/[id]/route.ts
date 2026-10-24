// app/api/flashcards/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import Flashcard from '../../../../lib/models/Strait';

// ===================== GET =====================
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const email = new URL(request.url).searchParams.get('user');

        await connectDb();
        const card = await Flashcard.findById(id);

        if (!card) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (card.userEmail !== email && !card.isPublic) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(card);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

// ===================== PATCH =====================
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const email = new URL(request.url).searchParams.get('user');
        const body = await request.json();

        await connectDb();
        const card = await Flashcard.findById(id);

        if (!card) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (card.userEmail !== email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updated = await Flashcard.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// ===================== DELETE =====================
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const email = new URL(request.url).searchParams.get('user');

        await connectDb();
        const card = await Flashcard.findById(id);

        if (!card) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (card.userEmail !== email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Flashcard.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
