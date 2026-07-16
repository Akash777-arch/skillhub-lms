import React, { useEffect, useState } from 'react';
import { CourseCard } from '../components/CourseCard';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Link, Navigate } from 'react-router-dom';
import { Award } from 'lucide-react';

export const MyCoursesPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchMyCourses = async () => {
      try {
        const res = await api.get('/enrollments/me');
        setEnrollments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyCourses();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/" />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Courses</h1>
        <p className="text-text-secondary">All the courses you are currently enrolled in.</p>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading 
            ? Array.from({ length: 4 }).map((_, i) => <CourseCard key={i} loading={true} />)
            : enrollments.map(enrollment => (
                <div key={enrollment._id} className="flex flex-col">
                  <Link to={`/course/${enrollment.course._id}`} className="flex-grow">
                    <CourseCard course={enrollment.course} />
                  </Link>
                  {enrollment.progress === 100 && (
                    <Link to={`/certificate/${enrollment._id}`} className="mt-2 w-full flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 font-bold py-2 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors text-sm">
                      <Award className="w-4 h-4" /> View Certificate
                    </Link>
                  )}
                </div>
              ))
          }
        </div>
        {!loading && enrollments.length === 0 && (
          <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-700/50 border-dashed mt-6">
            <p className="text-lg text-text-primary mb-2">Your library is empty</p>
            <p className="text-text-secondary">You haven't enrolled in any courses yet. Browse our catalog to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
