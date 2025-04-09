const express = require('express');
const router = express.Router();
const Message = require('../models/Messages');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Get all conversations for current user
router.get('/conversations', async (req, res) => {
  try {
    // Find all conversations that user is part of
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name avatar')
      .populate('lastMessage');
    
    // Format the response
    const formattedConversations = conversations.map(conv => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user.id
      );
      
      return {
        _id: conv._id,
        name: otherParticipant.name,
        avatar: otherParticipant.avatar,
        lastMessage: conv.lastMessage ? {
          text: conv.lastMessage.text,
          createdAt: conv.lastMessage.createdAt
        } : null
      };
    });
    
    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a specific conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }
    
    // Find all messages for this conversation
    const messages = await Message.find({
      $or: [
        { sender: conversation.participants[0], receiver: conversation.participants[1] },
        { sender: conversation.participants[1], receiver: conversation.participants[0] }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');
    
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    
    // Create new message
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      text
    });
    
    await newMessage.save();
    
    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.user.id, receiverId],
        lastMessage: newMessage._id
      });
    } else {
      // Update existing conversation
      conversation.lastMessage = newMessage._id;
      conversation.updatedAt = Date.now();
    }
    
    await conversation.save();
    
    // Populate sender info before sending response
    await newMessage.populate('sender', 'name avatar');
    await newMessage.populate('receiver', 'name avatar');
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;