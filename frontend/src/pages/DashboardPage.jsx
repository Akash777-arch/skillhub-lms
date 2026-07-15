import React, { useEffect, useState } from 'react';
import { CourseCard } from '../components/CourseCard';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { PlayCircle, Award, Library, Star } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { InstructorDashboardView } from '../components/InstructorDashboardView';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
    <div>
      <p className="text-text-muted text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-text-primary">{value}</h3>
    </div>
  </div>
);

const LearningDashboardView = ({ user }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/courses/recommendations');
        setRecommendations(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRecommendations(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const totalCompletedLessons = enrollments.reduce((acc, curr) => acc + (curr.completedLessons?.length || 0), 0);
  const totalCertificates = enrollments.filter(curr => curr.progress === 100).length;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Enrolled Courses" value={enrollments.length} icon={Library} colorClass="text-brand-purple" />
        <StatCard title="Lessons Completed" value={totalCompletedLessons} icon={PlayCircle} colorClass="text-brand-blue" />
        <StatCard title="Certificates" value={totalCertificates} icon={Award} colorClass="text-emerald-500" />
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">Continue Learning</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading 
            ? Array.from({ length: 4 }).map((_, i) => <CourseCard key={i} loading={true} />)
            : enrollments.map(enrollment => (
                <Link key={enrollment._id} to={`/course/${enrollment.course._id}`}>
                  <CourseCard course={enrollment.course} progress={enrollment.progress} />
                </Link>
              ))
          }
        </div>
        {!loading && enrollments.length === 0 && (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50 border-dashed">
            <p className="text-text-secondary">You haven't enrolled in any courses yet.</p>
          </div>
        )}
      </div>

      {/* Your Certificates */}
      {enrollments.some(e => e.progress === 100) && (
        <div className="pt-8 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Your Certificates</h2>
              <p className="text-sm text-text-secondary">Credentials earned from completed courses</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrollments.filter(e => e.progress === 100).map(enrollment => (
              <div key={enrollment._id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-colors group">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <Award className="w-8 h-8 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">100% DONE</span>
                  </div>
                  <h3 className="font-bold text-white mb-2 flex-grow">{enrollment.course.title}</h3>
                  <Link to={`/certificate/${enrollment._id}`} className="block w-full text-center py-2 bg-slate-700 text-white rounded font-medium group-hover:bg-emerald-500 transition-colors mt-4">
                    View Certificate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Courses */}
      <div className="pt-8 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-purple/10 rounded-lg border border-brand-purple/20">
            <Star className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Recommended for You</h2>
            <p className="text-sm text-text-secondary">Based on your interests and learning history</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loadingRecommendations 
            ? Array.from({ length: 4 }).map((_, i) => <CourseCard key={i} loading={true} />)
            : recommendations.map(course => (
                <Link key={course._id} to={`/course/${course._id}`}>
                  <CourseCard course={course} />
                </Link>
              ))
          }
        </div>
        {!loadingRecommendations && recommendations.length === 0 && (
          <p className="text-text-secondary italic">No recommendations available at this time.</p>
        )}
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState(user?.role === 'instructor' ? 'teaching' : 'learning');

  if (!isAuthenticated) return <Navigate to="/" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-text-secondary">Here is an overview of your journey on SkillHub.</p>
      </div>

      {user?.role === 'instructor' && (
        <div className="flex gap-4 border-b border-slate-700 mb-8">
          <button 
            onClick={() => setActiveTab('teaching')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'teaching' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Teaching
          </button>
          <button 
            onClick={() => setActiveTab('learning')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'learning' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Learning
          </button>
        </div>
      )}

      {user?.role === 'instructor' && activeTab === 'teaching' ? (
        <InstructorDashboardView />
      ) : (
        <LearningDashboardView user={user} />
      )}
    </div>
  );
};
