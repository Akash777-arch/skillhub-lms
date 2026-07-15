export const mockCourses = [
  {
    _id: "c1",
    title: "Full Stack MERN Bootcamp",
    description: "Learn MongoDB, Express, React, and Node.js from scratch. Build real-world projects and become a full stack developer. This course covers everything from basic JavaScript to advanced architectural patterns in React and Node.",
    instructorName: "Samidha",
    category: { name: "Web Development" },
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    _id: "c2",
    title: "Advanced UI/UX Design with Figma",
    description: "Master modern UI/UX principles, glassmorphism, and responsive design systems. Create beautiful, functional mockups that wow your users.",
    instructorName: "Alex Designer",
    category: { name: "Design" },
    thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    _id: "c3",
    title: "Python for Data Science",
    description: "Data analysis and machine learning basics using Python, Pandas, and Scikit-Learn. Learn to extract insights from massive datasets.",
    instructorName: "Dr. Data",
    category: { name: "Data Science" },
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    _id: "c4",
    title: "AWS Cloud Practitioner",
    description: "Pass the AWS Certified Cloud Practitioner exam on your first try with our comprehensive curriculum and practice tests.",
    instructorName: "Cloud Master",
    category: { name: "Cloud Computing" },
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  }
];

// Simulated API calls to test loading states
export const fetchCourses = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCourses), 800); // 800ms delay
  });
};

export const fetchCourseById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const course = mockCourses.find(c => c._id === id);
      if (course) resolve(course);
      else reject(new Error("Course not found"));
    }, 800);
  });
};
