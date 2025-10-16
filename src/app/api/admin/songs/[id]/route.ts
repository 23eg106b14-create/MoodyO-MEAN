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

// PUT /api/admin/songs/[id] - Update a song
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid song ID' }, { status: 400 });
    }

    await connectDB();

    const updatedSong = await Song.findByIdAndUpdate(
      id,
      { title, artist, src, cover, emotion },
      { new: true, runValidators: true }
    );

    if (!updatedSong) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSong);
  } catch (error) {
    console.error('Error updating song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/songs/[id] - Delete a song
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid song ID' }, { status: 400 });
    }

    const deletedSong = await Song.findByIdAndDelete(id);

    if (!deletedSong) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
