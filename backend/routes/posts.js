const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Get all posts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar');
    
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { content, image } = req.body;
    
    const newPost = new Post({
      user: req.user.id,
      content,
      image
    });
    
    await newPost.save();
    
    // Populate user info before sending response
    await newPost.populate('user', 'name avatar');
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike a post
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user already liked the post
    const index = post.likedBy.indexOf(req.user.id);
    
    if (index === -1) {
      // Like post
      post.likes += 1;
      post.likedBy.push(req.user.id);
    } else {
      // Unlike post
      post.likes -= 1;
      post.likedBy.splice(index, 1);
    }
    
    await post.save();
    
    res.json({
      likes: post.likes,
      liked: index === -1 // true if just liked, false if just unliked
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a post
router.post('/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const newComment = {
      user: req.user.id,
      text
    };
    
    post.comments.push(newComment);
    await post.save();
    
    // Get the newly added comment and populate user info
    const comment = post.comments[post.comments.length - 1];
    
    // We need to manually populate for the newly added comment
    const user = await User.findById(req.user.id).select('name avatar');
    
    res.status(201).json({
      _id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
