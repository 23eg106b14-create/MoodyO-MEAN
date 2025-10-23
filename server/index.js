const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Song = require('./models/Song');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://EeshanRohith:Rohith%40123@cluster0.mh1d1hz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Get songs by emotion
app.get('/api/songs/:emotion', async (req, res) => {
  try {
    const { emotion } = req.params;
    const songs = await Song.find({ emotion }).sort({ createdAt: 1 });
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new song (for populating the database)
// GET /api/admin/songs - Get all songs for admin
app.get('/api/admin/songs', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/songs - Add a new song
app.post('/api/admin/songs', async (req, res) => {
  try {
    const { title, artist, src, cover, emotion } = req.body;

    // Validation
    if (!title || !artist || !src || !cover || !emotion) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['happy', 'joyful', 'sad', 'depression'].includes(emotion)) {
      return res.status(400).json({ error: 'Invalid emotion' });
    }

    // Validate URL format
    try {
      new URL(src);
      new URL(cover);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format for audio or cover' });
    }

    const song = new Song({ title, artist, src, cover, emotion });
    await song.save();
    res.status(201).json(song);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/songs/:id - Update a song
app.put('/api/admin/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, src, cover, emotion } = req.body;

    // Validation
    if (!title || !artist || !src || !cover || !emotion) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['happy', 'joyful', 'sad', 'depression'].includes(emotion)) {
      return res.status(400).json({ error: 'Invalid emotion' });
    }

    // Validate URL format
    try {
      new URL(src);
      new URL(cover);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format for audio or cover' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid song ID' });
    }

    const updatedSong = await Song.findByIdAndUpdate(
      id,
      { title, artist, src, cover, emotion },
      { new: true, runValidators: true }
    );

    if (!updatedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(updatedSong);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/songs/:id - Delete a song
app.delete('/api/admin/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid song ID' });
    }

    const deletedSong = await Song.findByIdAndDelete(id);

    if (!deletedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all handler: return index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
