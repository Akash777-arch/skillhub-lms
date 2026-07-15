const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, createCourse, streamLesson, getInstructorCourses, updateCurriculum } = require('../controllers/courseController');
const { enrollCourse, getEnrollmentStatus } = require('../controllers/enrollmentController');
const { getReviews, addReview } = require('../controllers/reviewController');
const { submitAssignment, getMySubmission, getInstructorSubmissions, gradeSubmission, createAssignment } = require('../controllers/assignmentController');
const { getRecommendations } = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCourses)
  .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/instructor/me')
  .get(protect, authorize('instructor', 'admin'), getInstructorCourses);

router.route('/recommendations')
  .get(protect, getRecommendations);

router.route('/:id')
  .get(getCourseById);

router.route('/:id/curriculum')
  .put(protect, authorize('instructor', 'admin'), updateCurriculum);

router.route('/:courseId/enroll')
  .post(protect, enrollCourse);

router.route('/:courseId/enrollment-status')
  .get(protect, getEnrollmentStatus);

router.route('/:courseId/reviews')
  .get(getReviews)
  .post(protect, addReview);

// Assignments Routes
router.route('/:courseId/assignments')
  .post(protect, createAssignment);

router.route('/:courseId/assignments/:assignmentId/submit')
  .post(protect, submitAssignment);

router.route('/:courseId/assignments/:assignmentId/submission')
  .get(protect, getMySubmission);

router.route('/:courseId/submissions')
  .get(protect, getInstructorSubmissions);

router.route('/:courseId/submissions/:submissionId/grade')
  .put(protect, gradeSubmission);

router.route('/:id/lessons/:lessonId/stream')
  .get(protect, streamLesson);

module.exports = router;
