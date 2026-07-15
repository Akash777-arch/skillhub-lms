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

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

// Initialize app
const app = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://skillhub-lms-steel.vercel.app'
  ],
  credentials: true
}));
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev')); // Request Logger

// CSRF Protection Middleware
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax', // Allow cross-site within localhost
  }
});

// Provide CSRF Token Endpoint
app.get('/api/v1/auth/csrf-token', csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

// Apply CSRF to all API routes except GETs
app.use('/api/v1', csrfProtection);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/submissions', submissionRoutes);

app.get('/api/v1/health', (req, res) => {
  sendResponse(res, 200, true, 'API is running optimally');
});

// 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database and ONLY start server if successful
connectDB().then(async () => {
  const Course = require('./models/Course');
  const courses = await Course.find();
  let updatedCount = 0;
  
  const tutorialVideos = [
    'https://www.youtube.com/watch?v=erEgovG9WBs', // Web Dev
    'https://www.youtube.com/watch?v=Tn6-PIqc4UM', // React
    'https://www.youtube.com/watch?v=Sklc_fQBmcs', // Next.js
    'https://www.youtube.com/watch?v=DHjqpvDnNGE', // JS
    'https://www.youtube.com/watch?v=mr15Xzb1Ook', // Tailwind
    'https://www.youtube.com/watch?v=zJSY8tbf_ys', // Frontend
    'https://www.youtube.com/watch?v=PkZNo7MFNFg', // Javascript Course
    'https://www.youtube.com/watch?v=bMknfKXIFA8', // React Course
    'https://www.youtube.com/watch?v=1Rn18YqNl_o'  // Git & Github
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
  console.log(`Seeded YouTube URLs in ${updatedCount} courses.`);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
