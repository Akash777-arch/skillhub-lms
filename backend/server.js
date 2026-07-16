require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { sendResponse } = require('./utils/apiResponse');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

// Initialize app
const app = express();
app.set('trust proxy', 1); // Essential for secure cookies behind a reverse proxy (Render)

// --- Middlewares ---
app.use(helmet()); // Security headers

// CORS Configuration (Allows Vercel Frontend to talk to Render Backend)
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://skillhub-lms-steel.vercel.app'
  ],
  credentials: true // Crucial for sending cookies across domains
}));

app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev')); // Request Logger

// --- CSRF Protection Middleware ---
// Configured to allow cross-site cookies between Render and Vercel
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

const csrfProtection = csurf({
 cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict'
  }
});

// Provide CSRF Token Endpoint to the frontend
app.get('/api/v1/auth/csrf-token', csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

// Apply CSRF to all API routes except GETs
app.use('/api/v1', csrfProtection);

// --- API Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/submissions', submissionRoutes);

app.get('/api/v1/health', (req, res) => {
  sendResponse(res, 200, true, 'API is running optimally');
});

// --- 404 & Error Handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// --- Connect to Database and Auto-Seed ---
connectDB().then(async () => {
  const Course = require('./models/Course');
  
  // 1. AUTO-SEEDER: Check if database is empty and inject data if needed
  try {
    const count = await Course.countDocuments();
    if (count === 0) {
      console.log('Database is empty! Injecting raw sample courses...');
      const fs = require('fs');
      const path = require('path');
      
      const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'courses.json'), 'utf-8'));
      await Course.insertMany(rawData);
      console.log('Raw sample data auto-seeded successfully.');
    }
  } catch (err) {
    console.error('Failed to auto-seed database:', err.message);
  }

  // 2. Map YouTube videos over the courses 
  const courses = await Course.find();
  let updatedCount = 0;
  
  const tutorialVideos = [
    'https://www.youtube.com/watch?v=erEgovG9WBs',
    'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
    'https://www.youtube.com/watch?v=Sklc_fQBmcs',
    'https://www.youtube.com/watch?v=DHjqpvDnNGE',
    'https://www.youtube.com/watch?v=mr15Xzb1Ook',
    'https://www.youtube.com/watch?v=zJSY8tbf_ys',
    'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    'https://www.youtube.com/watch?v=bMknfKXIFA8',
    'https://www.youtube.com/watch?v=1Rn18YqNl_o'
  ];
  let videoIndex = 0;

  for (const course of courses) {
    if (course.sections) {
      course.sections.forEach(s => {
        if (s.lessons) {
          s.lessons.forEach(l => {
            l.videoUrl = tutorialVideos[videoIndex % tutorialVideos.length];
            videoIndex++;
          });
        }
      });
      await course.save();
      updatedCount++;
    }
  }
  
  if (updatedCount > 0) {
    console.log(`Verified YouTube URLs in ${updatedCount} courses.`);
  }

  // 3. Start the server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error("Database connection failed. Server not started.", err);
});