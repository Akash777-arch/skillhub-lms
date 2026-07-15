const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submissionText: {
      type: String
    },
    submissionUrl: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'graded'],
      default: 'pending'
    },
    score: {
      type: Number
    },
    feedback: {
      type: String
    }
  },
  { timestamps: true }
);

// One submission per student per assignment
assignmentSubmissionSchema.index({ student: 1, assignmentId: 1 }, { unique: true });

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
module.exports = AssignmentSubmission;
