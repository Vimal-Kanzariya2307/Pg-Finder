import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toggle favorite
router.post('/favorites/:pgId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pgId = req.params.pgId;
    const idx = user.favorites.indexOf(pgId);

    if (idx === -1) {
      user.favorites.push(pgId);
    } else {
      user.favorites.splice(idx, 1);
    }
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('favorites');
    res.json({ success: true, favorites: updatedUser.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get favorites
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'owner', select: 'name phone email' }
    });
    res.json({ success: true, data: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
