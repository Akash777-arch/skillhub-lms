const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { sendResponse } = require('../utils/apiResponse');
const NodeCache = require('node-cache');
const https = require('https');

// Cache instance (TTL: 5 minutes)
const courseCache = new NodeCache({ stdTTL: 300 });

// @desc    Get all published courses (Paginated)
// @route   GET /api/v1/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    const cacheKey = `courses_page_${page}_limit_${limit}_cat_${category || 'all'}`;
    const cachedData = courseCache.get(cacheKey);

    if (cachedData) {
      return sendResponse(res, 200, true, 'Courses fetched (cached)', cachedData);
    }

    const query = { isPublished: true };
    if (category) {
      query.category = category;
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .skip(skip)
      .limit(limit);

    // Manually strip videoUrl to avoid Mongoose projection bugs on populated subdocuments
    const sanitizedCourses = courses.map(c => {
      const courseObj = c.toObject();
      if (courseObj.sections) {
        courseObj.sections.forEach(s => {
          if (s.lessons) s.lessons.forEach(l => {
            if (l.videoUrl && !l.videoUrl.includes('youtube') && !l.videoUrl.includes('youtu.be')) {
              delete l.videoUrl;
            }
          });
        });
      }
      return courseObj;
    });

    const pagination = {
      total,
      page,
      pages: Math.ceil(total / limit)
    };

    const responseData = { courses: sanitizedCourses, pagination };
    courseCache.set(cacheKey, responseData);

    sendResponse(res, 200, true, 'Courses fetched', responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar');
      
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const courseObj = course.toObject();
    if (courseObj.sections) {
      courseObj.sections.forEach(s => {
        if (s.lessons) s.lessons.forEach(l => {
          if (l.videoUrl && !l.videoUrl.includes('youtube') && !l.videoUrl.includes('youtu.be')) {
            delete l.videoUrl;
          }
        });
      });
    }
    
    sendResponse(res, 200, true, 'Course fetched', courseObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Stream video for a lesson (Proxy)
// @route   GET /api/v1/courses/:id/lessons/:lessonId/stream
// @access  Private
const streamLesson = async (req, res, next) => {
  try {
    const { id, lessonId } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    let lesson = null;
    for (const section of course.sections) {
      lesson = section.lessons.id(lessonId);
      if (lesson) break;
    }

    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    // Check Authorization
    let isAuthorized = false;
    if (lesson.isFreePreview) {
      isAuthorized = true;
    } else if (req.user) {
      const enrollment = await Enrollment.findOne({ user: req.user._id, course: id });
      if (enrollment) isAuthorized = true;
      if (course.instructor.toString() === req.user._id.toString()) isAuthorized = true;
    }

    if (!isAuthorized) {
      res.status(403);
      throw new Error('Not authorized to view this lesson');
    }

    // Stream the remote video
    https.get(lesson.videoUrl, (videoRes) => {
      res.writeHead(videoRes.statusCode, videoRes.headers);
      videoRes.pipe(res);
    }).on('error', (e) => {
      console.error(e);
      res.status(500).send('Video streaming error');
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private (Instructor/Admin)
const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, price, thumbnailUrl } = req.body;
    
    const defaultThumbnails = [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80'
    ];
    const finalThumbnailUrl = thumbnailUrl || defaultThumbnails[Math.floor(Math.random() * defaultThumbnails.length)];

    const course = await Course.create({
      title,
      description,
      category,
      price,
      thumbnailUrl: finalThumbnailUrl,
      instructor: req.user._id,
    });
    
    courseCache.flushAll(); // Invalidate cache

    sendResponse(res, 201, true, 'Course created successfully', course);
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses created by instructor
// @route   GET /api/v1/courses/instructor/me
// @access  Private (Instructor)
const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 });
      
    // Manually strip videoUrl to avoid Mongoose projection bugs
    const sanitizedCourses = courses.map(c => {
      const courseObj = c.toObject();
      if (courseObj.sections) {
        courseObj.sections.forEach(s => {
          if (s.lessons) s.lessons.forEach(l => delete l.videoUrl);
        });
      }
      return courseObj;
    });

    sendResponse(res, 200, true, 'Instructor courses fetched', sanitizedCourses);
  } catch (error) {
    next(error);
  }
};

// @desc    Update course curriculum (sections, lessons, assignments)
// @route   PUT /api/v1/courses/:id/curriculum
// @access  Private (Instructor)
const updateCurriculum = async (req, res, next) => {
  try {
    const { sections, assignments } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this course');
    }

    if (sections) course.sections = sections;
    if (assignments) course.assignments = assignments;
    await course.save();

    courseCache.flushAll();

    sendResponse(res, 200, true, 'Curriculum updated successfully', course);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCourses, getCourseById, createCourse, streamLesson, getInstructorCourses, updateCurriculum };
