import { NextResponse } from "next/server";
import { connectDb } from "../../../../lib/db";
import BengaliWordSource from "../../../../lib/models/BengaliWordsOrigin";

// Correct GET
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDb();
  try {
    const word = await BengaliWordSource.findById(id);
    if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });
    return NextResponse.json(word);
  } catch {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
}

// Correct PUT
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDb();
  try {
    const data = await req.json();
    const updatedWord = await BengaliWordSource.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!updatedWord) return NextResponse.json({ error: "Word not found" }, { status: 404 });
    return NextResponse.json(updatedWord);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Correct DELETE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDb();
  try {
    const deletedWord = await BengaliWordSource.findByIdAndDelete(id);
    if (!deletedWord) return NextResponse.json({ error: "Word not found" }, { status: 404 });
    return NextResponse.json({ message: "Word deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
