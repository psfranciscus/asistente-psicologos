const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  psychologistId: {
    type: String,
    required: true,
    index: true
  },
  psychologistInfo: {
    name: String,
    specialty: String,
    orientation: String
  },
  messages: [{
    type: {
      type: String,
      enum: ['text', 'voice', 'audio'],
      required: true
    },
    input: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualizar updatedAt antes de guardar
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema); 