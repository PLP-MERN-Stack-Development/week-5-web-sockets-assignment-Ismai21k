const Room = require('../models/room');
const User = require('../models/user');

let io; // socket.io instance

// function to inject io from index.js
const setIO = (socketIO) => {
  io = socketIO;
};

// Get all public rooms
const getPublicRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ 
      type: 'public', 
      isActive: true 
    }).populate('creator', 'username');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
  }
};

// Get user's rooms
const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      participants: req.user.id,
      isActive: true
    }).populate('creator', 'username');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user rooms', error: error.message });
  }
};

// ✅ Create a new room
const createRoom = async (req, res) => {
  try {
    const { name, description, type = 'public', maxParticipants = 100 } = req.body;

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room name already exists' });
    }

    const room = new Room({
      name,
      description,
      type,
      creator: req.user.id,
      participants: [req.user.id],
      admins: [req.user.id],
      maxParticipants
    });

    await room.save();
    await room.populate('creator', 'username');
    const populatedRoom = room;

    // 🔥 Broadcast new room
    if (io) {
      io.emit('room_created', populatedRoom);
    }

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
};

// ✅ Join a room
const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId).populate('creator', 'username');

    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.isActive) return res.status(400).json({ message: 'Room is not active' });
    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({ message: 'Room is full' });
    }

    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      room.lastActivity = new Date();
      await room.save();
    }

    await room.populate('participants', 'username online');
    const populatedRoom = room;

    // 🔥 Broadcast user joined
    if (io) {
      io.emit('room_joined', {
        roomId,
        user: { id: req.user.id, username: req.user.username }
      });
    }

    res.json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Failed to join room', error: error.message });
  }
};

// ✅ Leave a room
const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.participants = room.participants.filter(id => id.toString() !== req.user.id);
    room.admins = room.admins.filter(id => id.toString() !== req.user.id);
    room.lastActivity = new Date();
    await room.save();

    // 🔥 Broadcast user left
    if (io) {
      io.emit('room_left', {
        roomId,
        user: { id: req.user.id, username: req.user.username }
      });
    }

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave room', error: error.message });
  }
};

// Get room details
const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId)
      .populate('creator', 'username')
      .populate('participants', 'username online')
      .populate('admins', 'username');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch room details', error: error.message });
  }
};

module.exports = {
  getPublicRooms,
  getUserRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomDetails,
  setIO
};
