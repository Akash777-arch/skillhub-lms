const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { sendResponse } = require('../utils/apiResponse');

// @desc    Get reviews for a course
// @route   GET /api/v1/courses/:courseId/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    sendResponse(res, 200, true, 'Reviews fetched successfully', reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a course
// @route   POST /api/v1/courses/:courseId/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Check if enrolled
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      res.status(403);
      throw new Error('You must be enrolled in the course to leave a review');
    }

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({ user: userId, course: courseId });
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this course');
    }

    const review = await Review.create({
      rating: Number(rating),
      comment,
      course: courseId,
      user: userId
    });

    // courseCache removed

    sendResponse(res, 201, true, 'Review added successfully', review);
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, addReview };
