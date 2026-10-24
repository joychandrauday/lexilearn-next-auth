import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import FeedPost, { IFeedPost } from '../../../lib/models/FeedPost';
import { seedInitialFeedIfEmpty } from '../../../lib/feed-seeder';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    await seedInitialFeedIfEmpty();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const tag = searchParams.get('tag');
    const userInterestsRaw = searchParams.get('interests') || '';
    const userEmail = searchParams.get('userEmail') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    const userInterests = userInterestsRaw
      ? userInterestsRaw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const query: Record<string, any> = {};

    if (category !== 'all' && category !== 'for_you') {
      if (category === 'community') {
        query.type = 'user_progress';
      } else if (category === 'vocab') {
        query.type = { $in: ['vocab_card', 'daily_editorial'] };
      } else if (category === 'grammar') {
        query.tags = { $in: ['grammar', 'preposition', 'rules'] };
      } else if (category === 'bcs' || category === 'bank' || category === 'primary') {
        query.category = category;
      }
    }

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    // Fetch posts
    const rawPosts = await FeedPost.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(60)
      .lean();

    // If personalized 'for_you' is active, rank posts by interest score
    let scoredPosts = rawPosts.map((post: any) => {
      let score = 0;
      if (post.isPinned) score += 1000;

      // Tag matching with user interests
      if (userInterests.length > 0 && Array.isArray(post.tags)) {
        const matches = post.tags.filter((t: string) =>
          userInterests.includes(t.toLowerCase())
        ).length;
        score += matches * 25;
      }

      // Category matching
      if (userInterests.includes(post.category?.toLowerCase())) {
        score += 30;
      }

      // Recency factor (hours since created)
      const hoursAgo = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 24) score += 20;
      else if (hoursAgo < 72) score += 10;

      // Engagement factor
      score += (post.likes || 0) * 2 + (post.bookmarks || 0) * 3 + (post.viewsCount || 0) * 0.1;

      return {
        ...post,
        _score: score,
        isLiked: userEmail ? post.likedBy?.includes(userEmail) : false,
        isBookmarked: userEmail ? post.bookmarkedBy?.includes(userEmail) : false,
      };
    });

    if (category === 'for_you' || userInterests.length > 0) {
      scoredPosts.sort((a, b) => b._score - a._score);
    }

    const paginated = scoredPosts.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total: scoredPosts.length,
      hasMore: skip + limit < scoredPosts.length,
      posts: paginated,
    });
  } catch (error: any) {
    console.error('GET /api/feed error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();

    const {
      title,
      content,
      type = 'user_progress',
      tags = [],
      category = 'bcs',
      difficulty = 'medium',
      author,
      mcqData,
      vocabData,
      progressData,
    } = body;

    if (!title || !author?.name || !author?.email) {
      return NextResponse.json(
        { error: 'পোস্টের শিরোনাম এবং লেখকের তথ্য আবশ্যক' },
        { status: 400 }
      );
    }

    const newPost = await FeedPost.create({
      title,
      content: content || '',
      type,
      tags: tags.map((t: string) => t.toLowerCase()),
      category,
      difficulty,
      author,
      mcqData,
      vocabData,
      progressData,
      likes: 0,
      likedBy: [],
      bookmarks: 0,
      bookmarkedBy: [],
      viewsCount: 1,
      isPinned: false,
    });

    return NextResponse.json({
      success: true,
      post: newPost,
      message: 'পোস্ট সফলভাবে পাবলিশ হয়েছে!',
    });
  } catch (error: any) {
    console.error('POST /api/feed error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
