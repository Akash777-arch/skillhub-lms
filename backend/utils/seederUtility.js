const User = require('../models/User');
const Course = require('../models/Course');

const seedDatabase = async () => {
  try {
    const count = await Course.countDocuments();
    if (count > 0) return; // Only seed if empty

    await Course.deleteMany();

    let instructor = await User.findOne({ email: 'instructor@skillhub.com' });
    if (!instructor) {
      instructor = new User({ name: 'Samidha', email: 'instructor@skillhub.com', password: 'password123', role: 'instructor' });
      await instructor.save();
    }

    await Course.insertMany([
      {
        title: "Full Stack MERN Bootcamp (Live from Memory DB!)",
        description: "This data is running entirely in an isolated in-memory MongoDB instance! No Windows Admin privileges required to run this.",
        instructor: instructor._id,
        category: "Web Development",
        price: 99.99,
        thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
        isPublished: true,
        lessons: [
          { title: "Introduction", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", order: 1, isFreePreview: true }
        ]
      },
      {
        title: "UI/UX Mastery (Live from Memory DB!)",
        description: "Figma secrets from the pros. Running entirely in memory.",
        instructor: instructor._id,
        category: "Design",
        price: 49.99,
        thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop",
        isPublished: true,
        lessons: [
          { title: "Design Systems", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", order: 1, isFreePreview: true }
        ]
      }
    ]);

    console.log('In-Memory Database Successfully Seeded!');
  } catch (error) {
    console.error(`Seeder Error: ${error.message}`);
  }
};

module.exports = seedDatabase;
