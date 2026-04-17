import express from 'express';
import PG from '../models/PG.js';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalPGs, pendingPGs, totalUsers, totalInquiries, students, owners] = await Promise.all([
      PG.countDocuments(),
      PG.countDocuments({ status: 'pending' }),
      User.countDocuments(),
      Inquiry.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'owner' })
    ]);
    res.json({ success: true, stats: { totalPGs, pendingPGs, totalUsers, totalInquiries, students, owners } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all PGs
router.get('/pgs', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const pgs = await PG.find(query).populate('owner', 'name email').sort('-createdAt').skip((page-1)*limit).limit(parseInt(limit));
    const total = await PG.countDocuments(query);
    res.json({ success: true, data: pgs, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve / reject PG
router.put('/pgs/:id/status', async (req, res) => {
  try {
    const { status, isFeatured } = req.body;
    const update = { status };
    if (isFeatured !== undefined) update.isFeatured = isFeatured;
    const pg = await PG.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: pg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle user active status
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
