import { NextResponse } from 'next/server';
import { connectDb } from '../../../../../lib/db';
import Word from '../../../../../lib/models/Word';
import { auth } from '../../../../../lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Word ID required' }, { status: 400 });
    }

    const session = await auth();
    const userEmail = session?.user?.email?.toLowerCase().trim();

    let isNewViewer = false;
    if (userEmail) {
      const existing = await Word.findById(id).select('viewedBy uniqueViewsCount').lean();
      if (existing) {
        const viewedByList = (existing as any).viewedBy || [];
        if (!viewedByList.includes(userEmail)) {
          isNewViewer = true;
        }
      }
    }

    const updateOps: any = {
      $inc: {
        viewCount: 1,
        ...(isNewViewer ? { uniqueViewsCount: 1 } : {}),
      },
      $set: {
        lastViewedAt: new Date(),
      },
    };

    if (userEmail) {
      updateOps.$addToSet = { viewedBy: userEmail };
    }

    const updated = await Word.findByIdAndUpdate(id, updateOps, { new: true })
      .select('viewCount uniqueViewsCount word')
      .lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Word not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      viewCount: (updated as any).viewCount || 1,
      uniqueViewsCount: (updated as any).uniqueViewsCount || 0,
    });
  } catch (error: any) {
    console.error('Track word view error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to track view' },
      { status: 500 }
    );
  }
}
