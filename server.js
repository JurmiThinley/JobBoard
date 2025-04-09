const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const authRoutes = require('./backend/routes/auth');
const postRoutes = require('./backend/routes/posts');
const messageRoutes = require('./backend/routes/messages');
const authMiddleware = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialapp')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a room for user-specific events
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined personal room`);
  });
  
  // Handle private messages
  socket.on('sendMessage', (data) => {
    io.to(data.receiverId).emit('newMessage', data);
  });
  
  // Handle real-time post updates
  socket.on('likePost', (data) => {
    socket.broadcast.emit('postLiked', data);
  });
  
  socket.on('newComment', (data) => {
    socket.broadcast.emit('commentAdded', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', authMiddleware, postRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
