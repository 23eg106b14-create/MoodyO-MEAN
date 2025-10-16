const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  src: {
    type: String,
    required: true
  },
  cover: {
    type: String,
    required: true
  },
  emotion: {
    type: String,
    required: true,
    enum: ['happy', 'joyful', 'sad', 'depression']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Song', songSchema);
