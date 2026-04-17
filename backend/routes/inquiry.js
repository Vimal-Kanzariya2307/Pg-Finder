import express from 'express';
import Inquiry from '../models/Inquiry.js';
import PG from '../models/PG.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Send inquiry (student)
router.post('/', protect, async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'student') {
      return res.status(403).json({ success: false, message: 'Please use a student account to send an inquiry.' });
    }

    const { pgId, message, moveInDate, roomType } = req.body;
    const pg = await PG.findById(pgId);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const inquiry = await Inquiry.create({
      pg: pgId,
      student: req.user._id,
      owner: pg.owner,
      message,
      moveInDate,
      roomType
    });

    await inquiry.populate([{ path: 'pg', select: 'title address' }, { path: 'student', select: 'name email phone' }]);
    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get student's inquiries
router.get('/my', protect, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ student: req.user._id })
      .populate('pg', 'title address photos')
      .populate('owner', 'name phone email')
      .sort('-createdAt');
    res.json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get owner's received inquiries
router.get('/received', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ owner: req.user._id })
      .populate('pg', 'title address photos')
      .populate('student', 'name phone email')
      .sort('-createdAt');
    res.json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Owner responds to inquiry
router.put('/:id/respond', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { ownerResponse } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { ownerResponse, status: 'responded' },
      { new: true }
    ).populate('student', 'name email');
    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
