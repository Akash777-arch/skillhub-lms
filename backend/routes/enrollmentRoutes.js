const express = require('express');
const router = express.Router();
const { getMyEnrollments, toggleLessonComplete, getCertificateByEnrollmentId } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/me').get(protect, getMyEnrollments);
router.route('/certificate/:id').get(getCertificateByEnrollmentId);
router.route('/:courseId/lessons/:lessonId/complete').post(protect, toggleLessonComplete);

module.exports = router;
