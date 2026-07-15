const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { sendResponse } = require('../utils/apiResponse');

// @desc    Get AI-powered course recommendations based on watch/enrollment history
// @route   GET /api/v1/courses/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user's enrollments
    const enrollments = await Enrollment.find({ user: userId }).populate('course', 'category title');
    
    const enrolledCourseIds = enrollments.map(e => e.course._id);

    // 2. Fallback if no enrollments: return highest rated courses overall
    if (enrollments.length === 0) {
      const topCourses = await Course.find({ isPublished: true })
        .sort('-averageRating -numReviews')
        .limit(8)
        .populate('instructor', 'name avatar');
      return sendResponse(res, 200, true, 'Top courses fetched (no history)', topCourses);
    }

    // 3. Calculate Category Affinity Score
    // We'll give a base score for being enrolled, and extra points if progress > 50% or 100%
    const categoryScores = {};

    enrollments.forEach(e => {
      const category = e.course.category;
      if (!category) return;
      
      let score = 1; // Base score for enrollment
      if (e.progress > 50) score += 1;
      if (e.progress === 100) score += 2; // High affinity for completed topics
      
      categoryScores[category] = (categoryScores[category] || 0) + score;
    });

    // Sort categories by score descending
    const sortedCategories = Object.keys(categoryScores).sort((a, b) => categoryScores[b] - categoryScores[a]);
    
    // Pick the top 2-3 categories
    const topCategories = sortedCategories.slice(0, 3);

    // 4. Query for recommended courses
    let recommendedCourses = [];
    
    if (topCategories.length > 0) {
      recommendedCourses = await Course.find({
        _id: { $nin: enrolledCourseIds },
        category: { $in: topCategories },
        isPublished: true
      })
      .sort('-averageRating -numReviews')
      .limit(8)
      .populate('instructor', 'name avatar');
    }

    // 5. If we didn't find enough recommendations (e.g. they enrolled in all courses of that category),
    // fill the rest with globally highly rated courses
    if (recommendedCourses.length < 4) {
      const excludeIds = [...enrolledCourseIds, ...recommendedCourses.map(c => c._id)];
      const fallbackCourses = await Course.find({
        _id: { $nin: excludeIds },
        isPublished: true
      })
      .sort('-averageRating -numReviews')
      .limit(8 - recommendedCourses.length)
      .populate('instructor', 'name avatar');

      recommendedCourses = [...recommendedCourses, ...fallbackCourses];
    }

    sendResponse(res, 200, true, 'Recommendations fetched successfully', recommendedCourses);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations
};
