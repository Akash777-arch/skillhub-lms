const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { sendResponse } = require('../utils/apiResponse');

// @desc    Enroll in a course
// @route   POST /api/v1/courses/:courseId/enroll
// @access  Private
const enrollCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ user: userId, course: courseId });
    if (alreadyEnrolled) {
      res.status(400);
      throw new Error('You are already enrolled in this course');
    }

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId
    });

    course.studentCount = (course.studentCount || 0) + 1;
    await course.save();

    sendResponse(res, 201, true, 'Successfully enrolled in course', enrollment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/v1/enrollments/me
// @access  Private
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({
        path: 'course',
        select: 'title description thumbnailUrl category instructor averageRating numReviews',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })
      .sort('-createdAt');

    sendResponse(res, 200, true, 'Enrollments fetched', enrollments);
  } catch (error) {
    next(error);
  }
};

// @desc    Check enrollment status
// @route   GET /api/v1/courses/:courseId/enrollment-status
// @access  Private
const getEnrollmentStatus = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    
    sendResponse(res, 200, true, 'Status fetched', { 
      isEnrolled: !!enrollment,
      completedLessons: enrollment ? enrollment.completedLessons : [],
      progress: enrollment ? enrollment.progress : 0,
      enrollmentId: enrollment ? enrollment._id : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle lesson completion status
// @route   POST /api/v1/enrollments/:courseId/lessons/:lessonId/complete
// @access  Private
const toggleLessonComplete = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Check if lesson is already completed
    const lessonIndex = enrollment.completedLessons.indexOf(lessonId);
    let isCompleted = false;

    if (lessonIndex > -1) {
      // Remove it
      enrollment.completedLessons.splice(lessonIndex, 1);
    } else {
      // Add it
      enrollment.completedLessons.push(lessonId);
      isCompleted = true;
    }

    // Recalculate progress
    let totalLessons = 0;
    if (course.sections) {
      course.sections.forEach(s => {
        if (s.lessons) totalLessons += s.lessons.length;
      });
    }

    if (totalLessons > 0) {
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
    } else {
      enrollment.progress = 0;
    }

    await enrollment.save();

    sendResponse(res, 200, true, 'Lesson completion toggled', {
      isCompleted,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get certificate details by enrollment ID
// @route   GET /api/v1/enrollments/certificate/:id
// @access  Public
const getCertificateByEnrollmentId = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'name')
      .populate({
        path: 'course',
        select: 'title instructor',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      });

    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    if (!enrollment.progress || enrollment.progress < 99) {
      res.status(403);
      throw new Error('Course not completed yet');
    }

    sendResponse(res, 200, true, 'Certificate fetched', {
      studentName: enrollment.user.name,
      courseName: enrollment.course.title,
      instructorName: enrollment.course.instructor.name,
      completedAt: enrollment.updatedAt,
      enrollmentId: enrollment._id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollCourse,
  getMyEnrollments,
  getEnrollmentStatus,
  toggleLessonComplete,
  getCertificateByEnrollmentId
};
