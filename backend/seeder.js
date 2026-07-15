require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const importData = async () => {
  try {
    // Connect directly to the port where our local MongoMemoryServer runs
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillhub');
    await Course.deleteMany();
    await User.deleteMany();

    // The Pre-Save hook won't fire for insertMany unless we do it carefully, 
    // but for simple seeding we can bypass or create them individually.
    const instructor = new User({ name: 'Samidha', email: 'instructor@skillhub.com', password: 'password123', role: 'instructor' });
    await instructor.save();

    await Course.insertMany([
      {
        title: "Full Stack MERN Bootcamp (Live from MongoDB!)",
        description: "This course data is being fetched directly from our real Node.js and MongoDB backend. Notice how fast it loaded!",
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
        title: "UI/UX Mastery (Live from MongoDB!)",
        description: "Figma secrets from the pros. Real data.",
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

    console.log('Database Successfully Seeded!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
