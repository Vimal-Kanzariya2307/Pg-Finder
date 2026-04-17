import mongoose from 'mongoose';

const pgSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['PG', 'Hostel', 'Apartment', 'Studio'], default: 'PG' },
  gender: { type: String, enum: ['Male', 'Female', 'Co-ed'], required: true },
  
  address: {
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String }
  },

  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },

  rent: {
    single: { type: Number },
    double: { type: Number },
    triple: { type: Number }
  },

  deposit: { type: Number, default: 0 },
  
  amenities: [{
    type: String,
    enum: ['WiFi', 'AC', 'Meals', 'Laundry', 'Parking', 'CCTV', 'Gym', 'TV', 'Geyser', 'Power Backup', 'Water Purifier', 'Housekeeping']
  }],

  rules: [String],
  
  photos: [{ 
    url: String, 
    public_id: String 
  }],

  availableFrom: { type: Date, default: Date.now },
  totalRooms: { type: Number, default: 1 },
  availableRooms: { type: Number, default: 1 },

  status: { type: String, enum: ['pending', 'approved', 'rejected', 'inactive'], default: 'pending' },
  
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],

  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

pgSchema.index({ location: '2dsphere' });
pgSchema.index({ 'address.city': 1, status: 1 });

export default mongoose.model('PG', pgSchema);
