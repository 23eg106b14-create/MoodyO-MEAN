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
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://EeshanRohith:Rohith%40123@cluster0.mh1d1hz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// GET /api/songs/[emotion] - Get songs by emotion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ emotion: string }> }
) {
  try {
    const { emotion } = await params;

    // Validate emotion
    if (!['happy', 'joyful', 'sad', 'depression'].includes(emotion)) {
      return NextResponse.json({ error: 'Invalid emotion' }, { status: 400 });
    }

    await connectDB();
    const songs = await Song.find({ emotion }).sort({ createdAt: -1 });

    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching songs by emotion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
