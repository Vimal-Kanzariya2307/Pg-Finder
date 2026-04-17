import express from 'express';
import PG from '../models/PG.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get all approved PGs (public)
router.get('/', async (req, res) => {
  try {
    const { city, gender, type, minRent, maxRent, amenities, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    
    const query = { status: 'approved' };
    const andFilters = [];
    const rentFilter = {};
    const hasMinRent = minRent !== undefined && minRent !== '';
    const hasMaxRent = maxRent !== undefined && maxRent !== '';
    if (hasMinRent) rentFilter.$gte = parseInt(minRent, 10);
    if (hasMaxRent) rentFilter.$lte = parseInt(maxRent, 10);
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (gender) query.gender = gender;
    if (type) query.type = type;
    if (search) {
      andFilters.push({
        $or: [
          { title: new RegExp(search, 'i') },
          { 'address.area': new RegExp(search, 'i') },
          { 'address.city': new RegExp(search, 'i') }
        ]
      });
    }
    if (hasMinRent || hasMaxRent) {
      andFilters.push({
        $or: [
          { 'rent.single': rentFilter },
          { 'rent.double': rentFilter },
          { 'rent.triple': rentFilter }
        ]
      });
    }
    if (andFilters.length > 0) query.$and = andFilters;
    if (amenities) {
      const amenityList = amenities.split(',');
      query.amenities = { $all: amenityList };
    }

    const skip = (page - 1) * limit;
    const pgs = await PG.find(query).populate('owner', 'name phone email avatar').sort(sort).skip(skip).limit(parseInt(limit));
    const total = await PG.countDocuments(query);

    res.json({ success: true, data: pgs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get featured PGs
router.get('/featured', async (req, res) => {
  try {
    const pgs = await PG.find({ status: 'approved', isFeatured: true }).populate('owner', 'name phone email avatar').limit(6);
    res.json({ success: true, data: pgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single PG
router.get('/:id', async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id).populate('owner', 'name phone email avatar').populate('ratings.user', 'name avatar');
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });
    pg.views += 1;
    await pg.save();
    res.json({ success: true, data: pg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create PG (owner only)
router.post('/', protect, authorize('owner', 'admin'), upload.array('photos', 10), async (req, res) => {
  try {
    const pgData = JSON.parse(req.body.data || '{}');
    pgData.owner = req.user._id;
    if ((req.user.role || '').toLowerCase() === 'owner') {
      pgData.status = 'approved';
    }

    const linkedPhotos = Array.isArray(pgData.photos)
      ? pgData.photos
          .filter((photo) => photo?.url)
          .map((photo) => ({ url: photo.url, public_id: photo.public_id || '' }))
      : [];

    if (req.files?.length > 0) {
      const uploadedPhotos = req.files.map(f => ({
        url: `${process.env.CLIENT_URL?.replace('5173', '5000') || 'http://localhost:5000'}/uploads/${f.filename}`,
        public_id: f.filename
      }));
      pgData.photos = [...linkedPhotos, ...uploadedPhotos].slice(0, 10);
    } else {
      pgData.photos = linkedPhotos.slice(0, 10);
    }

    const pg = await PG.create(pgData);
    res.status(201).json({ success: true, data: pg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update PG
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('photos', 10), async (req, res) => {
  try {
    let pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });
    if (pg.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const pgData = JSON.parse(req.body.data || '{}');
    pgData.updatedAt = Date.now();
    if ((req.user.role || '').toLowerCase() === 'owner') {
      pgData.status = 'approved';
    }
    const incomingPhotos = Array.isArray(pgData.photos)
      ? pgData.photos
          .filter((photo) => photo?.url)
          .map((photo) => ({ url: photo.url, public_id: photo.public_id || '' }))
      : [];

    if (req.files?.length > 0) {
      const newPhotos = req.files.map(f => ({
        url: `http://localhost:5000/uploads/${f.filename}`,
        public_id: f.filename
      }));
      pgData.photos = [...incomingPhotos, ...newPhotos].slice(0, 10);
    } else {
      pgData.photos = incomingPhotos;
    }

    pg = await PG.findByIdAndUpdate(req.params.id, pgData, { new: true });
    res.json({ success: true, data: pg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete PG
router.delete('/:id', protect, async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });
    if (pg.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await pg.deleteOne();
    res.json({ success: true, message: 'PG deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const existing = pg.ratings.find(r => r.user.toString() === req.user._id.toString());
    if (existing) {
      existing.rating = rating;
      existing.review = review;
    } else {
      pg.ratings.push({ user: req.user._id, rating, review });
    }

    pg.totalReviews = pg.ratings.length;
    pg.averageRating = pg.ratings.reduce((sum, r) => sum + r.rating, 0) / pg.ratings.length;
    await pg.save();

    res.json({ success: true, data: pg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Owner's own PGs
router.get('/owner/my-listings', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const pgs = await PG.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: pgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
