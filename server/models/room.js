const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['public', 'private', 'direct'], 
    default: 'public' 
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  maxParticipants: { type: Number, default: 100 },
  allowFileSharing: { type: Boolean, default: true },
  allowReactions: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Index for better query performance
roomSchema.index({ type: 1, isActive: 1 });
roomSchema.index({ participants: 1 });


module.exports = mongoose.model('Room', roomSchema);
