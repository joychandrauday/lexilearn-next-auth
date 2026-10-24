import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import AspirantItem from '../../../../lib/models/AspirantItem';

// Starter items for new aspirants so their notebook has immediate value
const STARTER_PREP_ITEMS = [
  {
    title: 'Causative Verbs এর ব্যবহারের নিয়ম',
    itemType: 'rule',
    subject: 'english',
    category: 'Right Form of Verbs',
    content:
      'Make, Have, Let, Help, Get হলো প্রধান Causative Verbs।\n• Make/Have/Let + Person/Object + Base Form (V1)\n• Get + Person + to + V1 (কিন্তু Get + Object + V3)\nউদাহরণ: She made him clean (not to clean) the room.',
    mnemonic: 'Make/Have/Let এর পর ডাইরেক্ট V1, কিন্তু Get থাকলে ইনফিনিটিভ (to+V1) বসে!',
    tags: ['BCS English', 'Grammar Trap', 'Most Repeated'],
    targetExam: 'BCS',
    priority: 'high',
    isMastered: false,
  },
  {
    title: 'Ubiquitous',
    itemType: 'word',
    subject: 'english',
    category: 'High Frequency Vocab',
    secondaryText: 'সর্বব্যাপী / সর্বত্র বিদ্যমান',
    content:
      'Present, appearing, or found everywhere.\nExample: Smartphones have become ubiquitous in everyday modern life.',
    mnemonic: 'Ubi (উবি) + quitous (কোথায়) -> যা সর্বত্র বা সব জায়গায় পাওয়া যায়।',
    tags: ['43rd BCS', 'Bank AD', 'Antonym/Synonym'],
    targetExam: 'BCS / Bank',
    priority: 'high',
    isMastered: false,
  },
  {
    title: 'সংবিধানের গুরুত্বপূর্ণ অনুচ্ছেদসমূহ (প্রিলি স্পেশাল)',
    itemType: 'topic',
    subject: 'gk',
    category: 'বাংলাদেশ বিষয়াবলি',
    content:
      '• অনুচ্ছেদ ৭: সংবিধানের প্রাধান্য\n• অনুচ্ছেদ ১৯: সুযোগের সমতা\n• অনুচ্ছেদ ২৭: আইনের দৃষ্টিতে সমতা\n• অনুচ্ছেদ ২৮: ধর্ম প্রভৃতি কারণে বৈষম্য বিলোপ\n• অনুচ্ছেদ ৪৭: মৌলিক অধিকার সংক্রান্ত সুরক্ষা',
    mnemonic: '৭ এ প্রাধান্য, ১৯ এ সমতা, ২৭ এ আইন, ২৮ এ কোনো বৈষম্য নাই!',
    tags: ['BCS Prelims', 'Constitution', 'Guaranteed Marks'],
    targetExam: 'BCS',
    priority: 'high',
    isMastered: false,
  },
  {
    title: 'Die এর সাথে বিভিন্ন Preposition এর ব্যবহার',
    itemType: 'rule',
    subject: 'english',
    category: 'Appropriate Preposition',
    content:
      '• Die OF: রোগে মারা যাওয়া (Die of cholera/cancer)\n• Die FROM: অতিরিক্ত কারণে মারা যাওয়া (Die from overwork/wound)\n• Die BY: দুর্ঘটনায় বা বিষপানে (Die by accident/poison)\n• Die FOR: দেশের বা মহৎ কারণে (Die for the country)',
    mnemonic: 'রোগে OF, কাজে FROM, এক্সিডেন্টে BY, দেশের জন্য FOR!',
    tags: ['Repeated MCQ', 'Preposition Trap'],
    targetExam: 'BCS / Bank',
    priority: 'high',
    isMastered: false,
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const subject = searchParams.get('subject');
    const itemType = searchParams.get('itemType');
    const isMasteredParam = searchParams.get('isMastered');
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');

    const filter: any = { userEmail: cleanEmail };

    if (subject && subject !== 'all') {
      filter.subject = subject;
    }
    if (itemType && itemType !== 'all') {
      filter.itemType = itemType;
    }
    if (isMasteredParam !== null && isMasteredParam !== undefined && isMasteredParam !== 'all') {
      filter.isMastered = isMasteredParam === 'true';
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
        { mnemonic: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    let items = await AspirantItem.find(filter).sort({ createdAt: -1 }).lean();

    // If brand new user with 0 items, seed starter high-yield prep items
    if (items.length === 0 && !search && (!subject || subject === 'all')) {
      const existingCount = await AspirantItem.countDocuments({ userEmail: cleanEmail });
      if (existingCount === 0) {
        const seeded = STARTER_PREP_ITEMS.map((item) => ({
          ...item,
          userEmail: cleanEmail,
        }));
        await AspirantItem.insertMany(seeded);
        items = await AspirantItem.find(filter).sort({ createdAt: -1 }).lean();
      }
    }

    // Aggregated telemetry for aspirant
    const totalCount = await AspirantItem.countDocuments({ userEmail: cleanEmail });
    const masteredCount = await AspirantItem.countDocuments({ userEmail: cleanEmail, isMastered: true });
    const pendingCount = totalCount - masteredCount;

    return NextResponse.json({
      success: true,
      items,
      stats: {
        total: totalCount,
        mastered: masteredCount,
        pending: pendingCount,
      },
    });
  } catch (error: any) {
    console.error('GET /api/user/notebook error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();

    const { userEmail, title, itemType, subject, category, content, secondaryText, mnemonic, tags, targetExam, priority } = body;

    if (!userEmail || !title) {
      return NextResponse.json({ error: 'userEmail and title are required' }, { status: 400 });
    }

    const cleanEmail = userEmail.toLowerCase().trim();

    const newItem = await AspirantItem.create({
      userEmail: cleanEmail,
      title: title.trim(),
      itemType: itemType || 'topic',
      subject: subject || 'english',
      category: category || 'সাধারণ প্রস্তুতি',
      content: content || '',
      secondaryText: secondaryText || '',
      mnemonic: mnemonic || '',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      targetExam: targetExam || 'BCS',
      priority: priority || 'high',
      isMastered: false,
      reviewCount: 0,
    });

    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'প্রস্তুতি নোটবুকে সফলভাবে সংরক্ষিত হয়েছে!',
    });
  } catch (error: any) {
    console.error('POST /api/user/notebook error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { id, userEmail, action, isMastered, priority, content, mnemonic } = body;

    if (!id || !userEmail) {
      return NextResponse.json({ error: 'id and userEmail are required' }, { status: 400 });
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const item = await AspirantItem.findOne({ _id: id, userEmail: cleanEmail });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (action === 'toggle-mastered') {
      item.isMastered = !item.isMastered;
      if (item.isMastered) {
        item.lastReviewedAt = new Date();
        item.reviewCount = (item.reviewCount || 0) + 1;
      }
    } else if (action === 'update-review') {
      item.reviewCount = (item.reviewCount || 0) + 1;
      item.lastReviewedAt = new Date();
    } else {
      if (typeof isMastered === 'boolean') item.isMastered = isMastered;
      if (priority) item.priority = priority;
      if (content !== undefined) item.content = content;
      if (mnemonic !== undefined) item.mnemonic = mnemonic;
    }

    await item.save();

    return NextResponse.json({
      success: true,
      item,
      message: item.isMastered ? 'আইটেমটি আয়ত্ত হয়েছে বলে চিহ্নিত করা হলো' : 'রিভিশন তালিকায় ফিরিয়ে আনা হলো',
    });
  } catch (error: any) {
    console.error('PATCH /api/user/notebook error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userEmail = searchParams.get('userEmail');

    if (!id || !userEmail) {
      return NextResponse.json({ error: 'id and userEmail are required' }, { status: 400 });
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const deleted = await AspirantItem.findOneAndDelete({ _id: id, userEmail: cleanEmail });

    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'নোটবুক থেকে আইটেমটি মুছে ফেলা হয়েছে',
    });
  } catch (error: any) {
    console.error('DELETE /api/user/notebook error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
