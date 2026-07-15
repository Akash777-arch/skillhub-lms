const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: Number }, // in minutes
  order: { type: Number, required: true },
  isFreePreview: { type: Boolean, default: false }
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  lessons: [lessonSchema]
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  maxScore: { type: Number, default: 100 },
  dueDate: { type: Date },
  passingScore: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  averageRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  price: { type: Number, default: 0 },
  thumbnailUrl: { type: String, default: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop' },
  isPublished: { type: Boolean, default: true }, // Default true for testing
  sections: [sectionSchema],
  assignments: [assignmentSchema],
}, { timestamps: true });

// Text indexing for search
courseSchema.index({ title: 'text', description: 'text', category: 'text' });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
