const express = require('express');
const mongoose = require('mongoose');
const Song = require('./models/Song');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

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
app.post('/api/songs', async (req, res) => {
  try {
    const { title, artist, src, cover, emotion } = req.body;
    const song = new Song({ title, artist, src, cover, emotion });
    await song.save();
    res.status(201).json(song);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
