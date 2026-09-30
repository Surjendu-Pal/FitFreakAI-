const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

/* -------------------- CREATE POST -------------------- */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const post = new Post({
      user: req.user.id,
      text,
      image,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- GET ALL POSTS -------------------- */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name email') 
      .sort({ createdAt: -1 }); 
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- GET SINGLE POST -------------------- */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name email');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- DELETE POST -------------------- */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- LIKE / UNLIKE POST -------------------- */
router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.find((like) => like.user.toString() === req.user.id);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((like) => like.user.toString() !== req.user.id);
    } else {
      // Like
      post.likes.push({ user: req.user.id });
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- COMMENT ON POST -------------------- */
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user.id,
      text,
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
