# 🏠 PGFinder — Full Stack PG/Hostel Booking Platform

A production-grade SaaS platform for finding PG accommodations in India. Built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## ✨ Features

### 👨‍🎓 Students
- Browse and search PG listings with advanced filters (city, gender, type, rent range, amenities)
- View detailed PG pages with photo gallery, pricing, amenities, and reviews
- Send inquiries directly to PG owners
- Save favorite PGs
- Track all sent inquiries and owner responses
- Write reviews and rate PGs

### 🏠 PG Owners
- Register and list PGs with full details (photos, pricing, amenities, rules)
- Multi-step PG listing form with live preview
- Manage all listings with edit/update capability
- Receive and respond to student inquiries
- Track views and engagement on listings

### 🛡️ Admin
- Full dashboard with platform statistics
- Approve / Reject / Feature PG listings
- Manage all users (activate/deactivate accounts)
- View all pending listings queue

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Animations | Framer Motion |
| State Management | Zustand |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| File Uploads | Multer |

---

## 🚀 Setup Instructions

### Prerequisites — Install These First

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **MongoDB** (v6 or higher)
   - Download: https://www.mongodb.com/try/download/community
   - OR use **MongoDB Atlas** (free cloud): https://www.mongodb.com/atlas
   - Verify local install: `mongod --version`

3. **npm** (comes with Node.js)
   - Verify: `npm --version`

---

### 📦 Installation

#### Step 1: Clone / Extract the project

```bash
# If extracted from ZIP, navigate to project root
cd pgfinder
```

#### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
# Edit .env file with your MongoDB URI and other settings
# For local MongoDB: MONGODB_URI=mongodb://localhost:27017/pgfinder
# For Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pgfinder

# Seed the database with demo data
npm run seed
# OR: node seed.js

# Start backend server
npm run dev
# Server starts on http://localhost:5000

# Optional: require manual admin approval for owner listings
# Add this to backend/.env
# AUTO_APPROVE_PGS=false
```

#### Step 3: Setup Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
# App opens on http://localhost:5173
```

---

### 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@demo.com | admin1234 |
| **Student** | student@demo.com | demo1234 |
| **Owner** | owner@demo.com | demo1234 |

---

### 📁 Project Structure

```
pgfinder/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT auth middleware
│   │   ├── errorHandler.js    # Global error handler
│   │   └── upload.js          # Multer file upload
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── PG.js              # PG listing schema
│   │   └── Inquiry.js         # Inquiry schema
│   ├── routes/
│   │   ├── auth.js            # Auth routes (login/register)
│   │   ├── pg.js              # PG CRUD routes
│   │   ├── user.js            # User favorites routes
│   │   ├── admin.js           # Admin management routes
│   │   └── inquiry.js         # Inquiry routes
│   ├── uploads/               # Uploaded PG photos (auto-created)
│   ├── .env                   # Environment config
│   ├── seed.js                # Database seeder
│   └── server.js              # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Footer.jsx
    │   │   ├── pg/
    │   │   │   └── PGCard.jsx
    │   │   └── ui/
    │   │       └── SkeletonCard.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── SearchPage.jsx
    │   │   ├── PGDetailPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── NotFoundPage.jsx
    │   │   ├── student/
    │   │   │   ├── StudentDashboard.jsx
    │   │   │   ├── FavoritesPage.jsx
    │   │   │   └── MyInquiriesPage.jsx
    │   │   ├── owner/
    │   │   │   ├── OwnerDashboard.jsx
    │   │   │   ├── AddPGPage.jsx
    │   │   │   ├── EditPGPage.jsx
    │   │   │   └── ReceivedInquiriesPage.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminPGsPage.jsx
    │   │       └── AdminUsersPage.jsx
    │   ├── store/
    │   │   └── authStore.js    # Zustand auth store
    │   ├── utils/
    │   │   ├── api.js          # Axios instance
    │   │   └── helpers.js      # Utility functions
    │   ├── App.jsx             # Routes
    │   ├── main.jsx            # Entry point
    │   └── index.css           # Global styles
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

---

### 🌐 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/auth/me | Get current user | Token |
| GET | /api/pg | Get all approved PGs | Public |
| GET | /api/pg/featured | Get featured PGs | Public |
| GET | /api/pg/:id | Get single PG | Public |
| POST | /api/pg | Create PG listing | Owner |
| PUT | /api/pg/:id | Update PG | Owner |
| DELETE | /api/pg/:id | Delete PG | Owner |
| POST | /api/pg/:id/review | Add review | Student |
| GET | /api/pg/owner/my-listings | Owner's listings | Owner |
| POST | /api/users/favorites/:pgId | Toggle favorite | Student |
| GET | /api/users/favorites | Get favorites | Student |
| POST | /api/inquiries | Send inquiry | Student |
| GET | /api/inquiries/my | Student's inquiries | Student |
| GET | /api/inquiries/received | Owner's inquiries | Owner |
| PUT | /api/inquiries/:id/respond | Respond to inquiry | Owner |
| GET | /api/admin/stats | Dashboard stats | Admin |
| GET | /api/admin/pgs | All PGs | Admin |
| PUT | /api/admin/pgs/:id/status | Approve/Reject PG | Admin |
| GET | /api/admin/users | All users | Admin |
| PUT | /api/admin/users/:id/toggle | Toggle user | Admin |

---

### 🏗️ Production Build

```bash
# Build frontend
cd frontend
npm run build
# Output in frontend/dist/

# For production, serve static files from Express:
# Add to server.js:
# app.use(express.static('../frontend/dist'));
```

---

### 🔧 Environment Variables (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pgfinder
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

### 🐛 Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB is running: `sudo systemctl start mongod` (Linux) or start MongoDB service (Windows)
- For Atlas: check your IP whitelist and connection string

**Port already in use:**
- Change PORT in .env file
- Kill process: `npx kill-port 5000`

**CORS errors:**
- Make sure CLIENT_URL in .env matches your frontend URL

---

Made with ❤️ using React + Node.js
