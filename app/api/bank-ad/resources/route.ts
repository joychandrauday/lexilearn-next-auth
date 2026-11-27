import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdResource from '@/lib/models/BankAdResource';

export async function GET() {
  await connectDb();
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();

  const query: any = { isSystem: true };
  let userResources: any[] = [];

  if (email) {
    userResources = await BankAdResource.find({ userEmail: email }).lean();
  }

  const systemResources = await BankAdResource.find(query).sort({ resourceId: 1 }).lean();
  const allResources = [...systemResources, ...userResources];

  return NextResponse.json({ resources: allResources, isGuest: !email });
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: 'Please sign in to add custom resources' }, { status: 401 });
  }

  await connectDb();
  const body = await req.json().catch(() => ({}));
  const { subject, title, type, url, priority, notes } = body;

  if (!title || !subject) {
    return NextResponse.json({ error: 'Title and Subject are required' }, { status: 400 });
  }

  const count = await BankAdResource.countDocuments({ userEmail: email });
  const resourceId = `CUSTOM-${count + 1}`;

  const doc = await BankAdResource.create({
    userEmail: email,
    resourceId,
    subject,
    title,
    type: type || 'Website',
    url: url || '',
    priority: priority || 'High',
    status: 'Active',
    notes: notes || '',
    isSystem: false,
  });

  return NextResponse.json({ resource: doc });
}

export async function PATCH(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDb();
  const body = await req.json().catch(() => ({}));
  const { id, status, notes } = body;

  const update: any = {};
  if (status) update.status = status;
  if (notes !== undefined) update.notes = notes;

  const doc = await BankAdResource.findOneAndUpdate(
    { _id: id, userEmail: email },
    { $set: update },
    { new: true }
  );

  return NextResponse.json({ resource: doc });
}

export async function DELETE(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDb();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  await BankAdResource.deleteOne({ _id: id, userEmail: email, isSystem: false });
  return NextResponse.json({ success: true });
}
