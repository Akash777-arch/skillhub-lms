import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { CourseCard } from '../components/CourseCard';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, openAuthModal } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/courses/recommendations').then(res => {
        setCourses(res.data.data.slice(0, 4) || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      api.get('/courses?limit=4').then(res => {
        setCourses(res.data.data.courses || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Abstract Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/20 blur-[120px] rounded-full pointer-events-none" />
        
        <h1 className="relative text-4xl md:text-6xl font-extrabold text-text-primary tracking-tight max-w-4xl mb-6 leading-tight">
          Master in-demand skills with <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">SkillHub</span>
        </h1>
        <p className="relative text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
          Join thousands of learners achieving their goals. From Full Stack Development to UI/UX Design, our courses are tailored for your success.
        </p>
        <div className="relative flex flex-wrap justify-center gap-4">
          <Link to="/courses">
            <Button variant="primary" className="px-8 py-3 text-base">Explore Courses</Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="secondary" className="px-8 py-3 text-base">Go to Dashboard</Button>
            </Link>
          ) : (
            <Button variant="secondary" className="px-8 py-3 text-base" onClick={() => openAuthModal('register', 'instructor')}>
              Become an Instructor
            </Button>
          )}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="px-4 py-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              {isAuthenticated ? 'Recommended for You' : 'Featured Courses'}
            </h2>
            <p className="text-text-secondary">
              {isAuthenticated ? 'Hand-picked based on your learning history.' : 'Hand-picked by our expert instructors.'}
            </p>
          </div>
          <Link to="/courses">
            <Button variant="ghost">View all</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading 
            ? Array.from({ length: 4 }).map((_, i) => <CourseCard key={i} loading={true} />)
            : courses.map(course => (
                <Link key={course._id} to={`/course/${course._id}`}>
                  <CourseCard course={course} />
                </Link>
              ))
          }
        </div>
      </section>
    </div>
  );
};
