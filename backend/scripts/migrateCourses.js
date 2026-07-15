const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const connectDB = require('../config/db');

dotenv.config();

const migrateCourses = async () => {
  try {
    await connectDB();
    console.log('Database connected. Starting migration...');

    // We use strict: false or lean() to fetch documents because 
    // the schema might not let us access the old "lessons" array 
    // since we just removed it from Course.js
    const courses = await Course.find({}).lean();
    let updatedCount = 0;

    for (let course of courses) {
      if (course.lessons && course.lessons.length > 0 && (!course.sections || course.sections.length === 0)) {
        console.log(`Migrating course: ${course.title}`);
        
        // Wrap the flat lessons array into a single "General" section
        const generalSection = {
          title: 'General',
          order: 1,
          lessons: course.lessons
        };

        // Update directly in DB
        await Course.collection.updateOne(
          { _id: course._id },
          { 
            $set: { sections: [generalSection] },
            $unset: { lessons: 1 }
          }
        );
        
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} courses.`);
    process.exit(0);
  } catch (error) {
    console.error(`Error migrating courses: ${error.message}`);
    process.exit(1);
  }
};

migrateCourses();
