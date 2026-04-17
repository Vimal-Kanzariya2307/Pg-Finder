import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pgfinder';

const userSchema = new mongoose.Schema({ name: String, email: String, password: String, phone: String, role: String, isActive: { type: Boolean, default: true }, favorites: [] });
const pgSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const PG = mongoose.model('PG', pgSchema);

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await PG.deleteMany({});
    console.log('Cleared existing data');

    const hash = (pwd) => bcrypt.hashSync(pwd, 10);

    // Create users
    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@demo.com', password: hash('admin1234'), phone: '9876543210', role: 'admin' },
      { name: 'Rahul Sharma', email: 'student@demo.com', password: hash('demo1234'), phone: '9876543211', role: 'student' },
      { name: 'Priya Patel', email: 'student2@demo.com', password: hash('demo1234'), phone: '9876543212', role: 'student' },
      { name: 'Rajesh Kumar', email: 'owner@demo.com', password: hash('demo1234'), phone: '9876543213', role: 'owner' },
      { name: 'Sunita Verma', email: 'owner2@demo.com', password: hash('demo1234'), phone: '9876543214', role: 'owner' },
    ]);
    console.log('Created users:', users.map(u => u.email).join(', '));

    const owner1 = users[3]._id;
    const owner2 = users[4]._id;

    // PG listings
    const pgData = [
      {
        owner: owner1, title: 'Sunrise Boys PG - Koramangala', description: 'Premium fully-furnished PG for working professionals and students near Koramangala 5th Block. 24/7 security, home-cooked meals included. Walking distance to MG Road Metro.', type: 'PG', gender: 'Male',
        address: { street: '42, 5th Block', area: 'Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', landmark: 'Near Forum Mall' },
        rent: { single: 12000, double: 8000, triple: 6000 }, deposit: 24000,
        amenities: ['WiFi', 'Meals', 'Laundry', 'CCTV', 'Power Backup', 'Geyser'],
        rules: ['No smoking', 'Guests allowed till 10PM', 'No loud music after 10PM'],
        totalRooms: 20, availableRooms: 5, status: 'approved', isFeatured: true, views: 234,
        photos: [
          { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', public_id: 'demo1' },
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80', public_id: 'demo2' },
        ],
        ratings: [{ user: users[1]._id, rating: 4, review: 'Great location and clean rooms!' }], averageRating: 4, totalReviews: 1,
      },
      {
        owner: owner1, title: 'Green Valley Girls Hostel', description: 'Safe and comfortable hostel exclusively for women. Located in the heart of HSR Layout with easy access to tech parks. CCTV surveillance 24/7, biometric entry.', type: 'Hostel', gender: 'Female',
        address: { street: '18, Sector 4', area: 'HSR Layout', city: 'Bangalore', state: 'Karnataka', pincode: '560102', landmark: 'Near BDA Complex' },
        rent: { single: 14000, double: 9000 }, deposit: 28000,
        amenities: ['WiFi', 'AC', 'Meals', 'CCTV', 'Gym', 'Water Purifier', 'Housekeeping'],
        rules: ['Female residents only', 'No male guests', 'Gate closes at 11PM'],
        totalRooms: 30, availableRooms: 8, status: 'approved', isFeatured: true, views: 412,
        photos: [
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', public_id: 'demo3' },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80', public_id: 'demo4' },
        ],
        ratings: [{ user: users[2]._id, rating: 5, review: 'Best hostel in HSR, very safe!' }], averageRating: 5, totalReviews: 1,
      },
      {
        owner: owner2, title: 'Tech Park Studio Apartments', description: 'Modern studio apartments perfect for IT professionals. Fully furnished with modular kitchen, high-speed 100Mbps WiFi, and dedicated workstation. 5 min from Whitefield IT Corridor.', type: 'Studio', gender: 'Co-ed',
        address: { street: '7, EPIP Zone', area: 'Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066', landmark: 'Near ITPB' },
        rent: { single: 18000 }, deposit: 36000,
        amenities: ['WiFi', 'AC', 'Parking', 'Gym', 'Power Backup', 'TV', 'Water Purifier'],
        rules: ['No pets', 'Maintain cleanliness', 'No sub-letting'],
        totalRooms: 15, availableRooms: 3, status: 'approved', isFeatured: false, views: 189,
        photos: [
          { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80', public_id: 'demo5' },
          { url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=600&q=80', public_id: 'demo6' },
        ],
        averageRating: 0, totalReviews: 0,
      },
      {
        owner: owner2, title: 'Andheri Students PG', description: 'Budget-friendly PG near Mumbai University and SNDT college. Regular tiffin service, laundry facility, and study room available 24/7. Excellent connectivity via Western line.', type: 'PG', gender: 'Male',
        address: { street: '23, Versova Road', area: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', landmark: 'Near D-Mart' },
        rent: { single: 9500, double: 6500, triple: 5000 }, deposit: 19000,
        amenities: ['WiFi', 'Meals', 'Laundry', 'CCTV', 'Geyser'],
        rules: ['No alcohol', 'Maintain silence after 11PM'],
        totalRooms: 25, availableRooms: 12, status: 'approved', isFeatured: false, views: 97,
        photos: [
          { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', public_id: 'demo7' },
        ],
        averageRating: 0, totalReviews: 0,
      },
      {
        owner: owner1, title: 'Hitech City Luxury PG', description: 'Premium co-ed accommodation next to Hitech City IT park. Swimming pool, rooftop terrace, and in-house cafeteria. Ideal for top IT professionals.', type: 'PG', gender: 'Co-ed',
        address: { street: '15, Madhapur', area: 'Hitech City', city: 'Hyderabad', state: 'Telangana', pincode: '500081', landmark: 'Near Cyber Towers' },
        rent: { single: 16000, double: 11000 }, deposit: 32000,
        amenities: ['WiFi', 'AC', 'Meals', 'Gym', 'Parking', 'CCTV', 'Housekeeping', 'Power Backup'],
        rules: ['Professional tenants only', 'ID verification required'],
        totalRooms: 40, availableRooms: 7, status: 'approved', isFeatured: true, views: 321,
        photos: [
          { url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&q=80', public_id: 'demo8' },
          { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80', public_id: 'demo9' },
        ],
        averageRating: 0, totalReviews: 0,
      },
      {
        owner: owner2, title: 'Viman Nagar Girls PG - Pune', description: 'Comfortable and secure PG for working women and students in Viman Nagar. Close to Magarpatta City and Airport. Daily housekeeping, North Indian and South Indian meals.', type: 'PG', gender: 'Female',
        address: { street: '9, Clover Park', area: 'Viman Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411014', landmark: 'Near Phoenix Mall' },
        rent: { single: 11000, double: 7500 }, deposit: 22000,
        amenities: ['WiFi', 'Meals', 'Laundry', 'CCTV', 'Geyser', 'Water Purifier'],
        rules: ['Female residents only', 'Curfew at 10:30PM weekdays'],
        totalRooms: 18, availableRooms: 4, status: 'approved', isFeatured: false, views: 145,
        photos: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80', public_id: 'demo10' },
        ],
        averageRating: 0, totalReviews: 0,
      },
      {
        owner: owner1, title: 'Pending Review PG - Bangalore', description: 'New PG awaiting admin approval. Good location in Indiranagar.', type: 'PG', gender: 'Male',
        address: { street: '5, 100 Feet Road', area: 'Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038', landmark: 'Near Metro' },
        rent: { single: 13000, double: 8500 }, deposit: 26000,
        amenities: ['WiFi', 'AC', 'CCTV'],
        totalRooms: 10, availableRooms: 10, status: 'pending', views: 0,
        photos: [], averageRating: 0, totalReviews: 0,
      },
    ];

    await PG.insertMany(pgData);
    console.log(`Created ${pgData.length} PG listings`);

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Demo Login Credentials:');
    console.log('─────────────────────────────');
    console.log('Admin:   admin@demo.com   / admin1234');
    console.log('Student: student@demo.com / demo1234');
    console.log('Owner:   owner@demo.com   / demo1234');
    console.log('─────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
