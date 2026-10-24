import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../../lib/db';
import FeedPost from '../../../../../lib/models/FeedPost';
import Word from '../../../../../lib/models/Word';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await req.json();
    const { action, userEmail = 'anonymous@lexilearn.com', optionIndex } = body;

    const post = await FeedPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'পোস্ট খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    if (action === 'like') {
      const alreadyLiked = post.likedBy?.includes(userEmail);
      if (alreadyLiked) {
        post.likedBy = post.likedBy.filter((e) => e !== userEmail);
        post.likes = Math.max(0, (post.likes || 1) - 1);
      } else {
        post.likedBy = [...(post.likedBy || []), userEmail];
        post.likes = (post.likes || 0) + 1;
      }
      await post.save();
      return NextResponse.json({
        success: true,
        action: 'like',
        likes: post.likes,
        isLiked: !alreadyLiked,
      });
    }

    if (action === 'bookmark') {
      const alreadyBookmarked = post.bookmarkedBy?.includes(userEmail);
      if (alreadyBookmarked) {
        post.bookmarkedBy = post.bookmarkedBy.filter((e) => e !== userEmail);
        post.bookmarks = Math.max(0, (post.bookmarks || 1) - 1);
      } else {
        post.bookmarkedBy = [...(post.bookmarkedBy || []), userEmail];
        post.bookmarks = (post.bookmarks || 0) + 1;
      }
      await post.save();
      return NextResponse.json({
        success: true,
        action: 'bookmark',
        bookmarks: post.bookmarks,
        isBookmarked: !alreadyBookmarked,
      });
    }

    if (action === 'vote') {
      if (optionIndex === undefined || optionIndex === null) {
        return NextResponse.json({ error: 'optionIndex আবশ্যক' }, { status: 400 });
      }
      const key = String(optionIndex);
      const currentVotes = post.mcqData?.userVotes || new Map();
      const existingCount = currentVotes instanceof Map ? currentVotes.get(key) || 0 : (currentVotes as any)[key] || 0;
      
      if (currentVotes instanceof Map) {
        currentVotes.set(key, existingCount + 1);
      } else {
        (currentVotes as any)[key] = existingCount + 1;
      }

      post.markModified('mcqData.userVotes');
      await post.save();

      return NextResponse.json({
        success: true,
        action: 'vote',
        userVotes: post.mcqData?.userVotes,
      });
    }

    if (action === 'view') {
      await FeedPost.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
      return NextResponse.json({ success: true, action: 'view' });
    }

    if (action === 'save_to_deck') {
      if (!post.vocabData?.word) {
        return NextResponse.json({ error: 'এই কার্ডে কোনো শব্দ ডাটা নেই' }, { status: 400 });
      }
      const v = post.vocabData;
      const cleanWord = v.word.trim().toLowerCase();

      const existing = await Word.findOne({ word: cleanWord });
      if (existing) {
        const savedBy = existing.savedBy || [];
        if (!savedBy.includes(userEmail)) {
          savedBy.push(userEmail);
          existing.savedBy = savedBy;
          existing.savedCount = (existing.savedCount || 1) + 1;
          existing.verificationScore = Math.min(100, (existing.verificationScore || 70) + 3);
          await existing.save();
        }
      } else {
        await Word.create({
          userEmail,
          word: cleanWord,
          meaning: v.meaning,
          bangla: v.bangla,
          mnemonic: v.mnemonic,
          exam: post.category || 'bcs',
          examTags: v.examTags || ['Community Card'],
          savedBy: [userEmail],
          savedCount: 1,
          frequencyCount: 1,
          verificationScore: 85,
          verificationStatus: 'verified',
        });
      }

      // Also bookmark this post
      if (!post.bookmarkedBy?.includes(userEmail)) {
        post.bookmarkedBy = [...(post.bookmarkedBy || []), userEmail];
        post.bookmarks = (post.bookmarks || 0) + 1;
        await post.save();
      }

      return NextResponse.json({
        success: true,
        action: 'save_to_deck',
        message: `"${v.word}" আপনার পার্সোনাল ফ্ল্যাশকার্ড ডেকে যুক্ত হয়েছে!`,
      });
    }

    return NextResponse.json({ error: 'অজ্ঞাত অ্যাকশন' }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/feed/[id]/react error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
