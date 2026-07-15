const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/apiResponse');

// @desc    Submit an assignment
// @route   POST /api/v1/courses/:courseId/assignments/:assignmentId/submit
// @access  Private
const submitAssignment = async (req, res, next) => {
  try {
    const { courseId, assignmentId } = req.params;
    const { submissionText, submissionUrl } = req.body;
    const studentId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Verify assignment exists in course
    const assignment = course.assignments.id(assignmentId);
    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    // Check if already submitted
    let submission = await AssignmentSubmission.findOne({ 
      student: studentId, 
      assignmentId 
    });

    if (submission) {
      // Update existing if pending
      if (submission.status === 'graded') {
        res.status(400);
        throw new Error('Cannot update a graded assignment');
      }
      submission.submissionText = submissionText;
      submission.submissionUrl = submissionUrl;
      await submission.save();
    } else {
      // Create new
      submission = await AssignmentSubmission.create({
        course: courseId,
        assignmentId,
        student: studentId,
        submissionText,
        submissionUrl
      });
    }

    sendResponse(res, 201, true, 'Assignment submitted successfully', submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's submission for an assignment
// @route   GET /api/v1/courses/:courseId/assignments/:assignmentId/submission
// @access  Private
const getMySubmission = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const submission = await AssignmentSubmission.findOne({
      student: req.user._id,
      assignmentId
    });

    sendResponse(res, 200, true, 'Submission fetched', submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions for an instructor's course
// @route   GET /api/v1/courses/:courseId/submissions
// @access  Private (Instructor)
const getInstructorSubmissions = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    
    // Verify instructor
    const course = await Course.findById(courseId);
    if (!course || course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const submissions = await AssignmentSubmission.find({ course: courseId })
      .populate('student', 'name avatar')
      .sort('-createdAt');

    sendResponse(res, 200, true, 'Submissions fetched', submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions for all courses of an instructor
// @route   GET /api/v1/submissions/instructor/me
// @access  Private (Instructor)
const getAllInstructorSubmissions = async (req, res, next) => {
  try {
    const instructorId = req.user._id;
    // Find all courses by this instructor
    const courses = await Course.find({ instructor: instructorId }).select('_id title assignments');
    const courseIds = courses.map(c => c._id);

    const submissions = await AssignmentSubmission.find({ course: { $in: courseIds } })
      .populate('student', 'name email avatar')
      .populate('course', 'title')
      .sort('-createdAt');

    // Attach assignment title to submission object manually or just let frontend handle it
    const formattedSubmissions = submissions.map(sub => {
      const courseObj = courses.find(c => c._id.toString() === sub.course._id.toString());
      const assignment = courseObj ? courseObj.assignments.id(sub.assignmentId) : null;
      
      return {
        ...sub.toObject(),
        assignmentTitle: assignment ? assignment.title : 'Unknown Assignment',
        maxScore: assignment ? assignment.maxScore : 100
      };
    });

    sendResponse(res, 200, true, 'All submissions fetched', formattedSubmissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Grade a submission
// @route   PUT /api/v1/courses/:courseId/submissions/:submissionId/grade
// @access  Private (Instructor)
const gradeSubmission = async (req, res, next) => {
  try {
    const { courseId, submissionId } = req.params;
    const { score, feedback } = req.body;

    // Verify instructor
    const course = await Course.findById(courseId);
    if (!course || course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      res.status(404);
      throw new Error('Submission not found');
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';
    await submission.save();

    // Create Notification for the student
    const assignment = course.assignments.id(submission.assignmentId);
    await Notification.create({
      user: submission.student,
      title: 'Assignment Graded',
      message: `Your assignment "${assignment?.title || 'Unknown'}" in ${course.title} has been graded: ${score}/${assignment?.maxScore || 100}.`,
      type: 'grading',
      link: `/course/${course._id}?tab=assignments`
    });

    sendResponse(res, 200, true, 'Submission graded successfully', submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Add an assignment to a course
// @route   POST /api/v1/courses/:courseId/assignments
// @access  Private (Instructor)
const createAssignment = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { title, description, maxScore } = req.body;

        const course = await Course.findById(courseId);
        if (!course || course.instructor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized');
        }

        course.assignments.push({ title, description, maxScore });
        await course.save();

        sendResponse(res, 201, true, 'Assignment added successfully', course);
    } catch(error) {
        next(error);
    }
}

module.exports = {
  submitAssignment,
  getMySubmission,
  getInstructorSubmissions,
  getAllInstructorSubmissions,
  gradeSubmission,
  createAssignment
};
