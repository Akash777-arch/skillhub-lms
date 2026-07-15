const express = require('express');
const router = express.Router();
const { getAllInstructorSubmissions } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/instructor/me')
  .get(protect, getAllInstructorSubmissions);

module.exports = router;
