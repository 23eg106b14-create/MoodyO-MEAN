import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Song schema (matching the server model)
const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  src: { type: String, required: true },
  cover: { type: String, required: true },
  emotion: { type: String, required: true, enum: ['happy', 'joyful', 'sad', 'depression'] }
}, { timestamps: true });

const Song = mongoose.models.Song || mongoose.model('Song', songSchema);

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://EeshanRohith:<Rohith@123>@cluster0.mh1d1hz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// GET /api/admin/songs - Get all songs
export async function GET() {
  try {
    await connectDB();
    const songs = await Song.find().sort({ createdAt: -1 });
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/songs - Add a new song
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, artist, src, cover, emotion } = body;

  // Validation
  if (!title || !artist || !src || !cover || !emotion) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  if (!['happy', 'joyful', 'sad', 'depression'].includes(emotion)) {
    return NextResponse.json({ error: 'Invalid emotion' }, { status: 400 });
  }

  // Validate URL format
  try {
    new URL(src);
    new URL(cover);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format for audio or cover' }, { status: 400 });
  }

    const song = new Song({ title, artist, src, cover, emotion });
    await song.save();

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error('Error creating song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
