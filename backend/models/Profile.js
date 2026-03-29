const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Profile name is required'],
    trim: true,
    maxlength: [20, 'Name cannot exceed 20 characters']
  },
  avatar: {
    type: String,
    default: function() {
      const avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'];
      return avatars[Math.floor(Math.random() * avatars.length)];
    }
  },
  isKids: { type: Boolean, default: false },
  language: { type: String, default: 'en' },
  maturityRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'ALL'],
    default: 'ALL'
  },
  pin: { type: String, select: false }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
