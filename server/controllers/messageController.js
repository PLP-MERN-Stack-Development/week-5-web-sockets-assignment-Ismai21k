const Message = require('../models/message');
const User = require('../models/user');

// Get messages for a room or between two users
const getMessages = async (req, res) => {
  try {
    const { room, userId } = req.query;
    let messages;
    if (room) {
      messages = await Message.find({ room }).populate('sender', 'username');
    } else if (userId) {
      // Private messages between two users
      messages = await Message.find({
        $or: [
          { sender: req.user.id, receiver: userId },
          { sender: userId, receiver: req.user.id },
        ],
      }).populate('sender', 'username');
    } else {
      messages = [];
    }
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { content, receiver, room } = req.body;
    const message = new Message({
      sender: req.user.id,
      receiver,
      room,
      content,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body;
    // Ensure the user is the receiver of the message before marking it as read
    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiver: req.user.id },
      { read: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: 'Message not found or user is not the receiver' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark as read', error: error.message });
  }
};

module.exports = { getMessages, sendMessage, markAsRead };
