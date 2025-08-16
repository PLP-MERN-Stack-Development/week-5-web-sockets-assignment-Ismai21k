const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For private messages
  room: { type: String, default: 'general' }, // For group/room messages
  content: { type: String, required: true },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'file', 'audio', 'video'], 
    default: 'text' 
  },
  fileUrl: { type: String }, // URL for uploaded files
  fileName: { type: String }, // Original filename
  fileSize: { type: Number }, // File size in bytes
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Who read the message
  reactions: {
    type: Map,
    of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who reacted with this emoji
    default: {}
  },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }, // For reply messages
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { 
  timestamps: true 
});

// Index for better query performance
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
