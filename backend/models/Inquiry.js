import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  moveInDate: { type: Date },
  roomType: { type: String, enum: ['single', 'double', 'triple'] },
  status: { type: String, enum: ['pending', 'responded', 'closed'], default: 'pending' },
  ownerResponse: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Inquiry', inquirySchema);
