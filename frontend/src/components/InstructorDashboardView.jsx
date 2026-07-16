import React, { useEffect, useState } from 'react';
import { CourseCard } from './CourseCard';
import { Button } from './Button';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { PlusCircle, Users, BookOpen, DollarSign } from 'lucide-react';

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

export const InstructorDashboardView = () => {
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  // Grading State
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, submissionsRes] = await Promise.all([
          api.get('/courses/instructor/me'),
          api.get('/submissions/instructor/me').catch(() => ({ data: { data: [] } }))
        ]);
        setCourses(coursesRes.data.data);
        setSubmissions(submissionsRes.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleGrade = async (e) => {
    e.preventDefault();
    setSubmittingGrade(true);
    try {
      const res = await api.put(`/courses/${gradingSubmission.course._id}/submissions/${gradingSubmission._id}/grade`, {
        score: Number(score),
        feedback
      });
      
      // Update local state
      setSubmissions(submissions.map(sub => 
        sub._id === gradingSubmission._id ? { ...sub, ...res.data.data } : sub
      ));
      
      setGradingSubmission(null);
      setScore('');
      setFeedback('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade submission');
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Instructor Dashboard</h2>
          <p className="text-text-secondary">Manage your courses and view your impact.</p>
        </div>
        <Link to="/dashboard/create-course">
          <Button variant="primary" className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Courses" value={courses.length} icon={BookOpen} colorClass="text-brand-purple" />
        <StatCard 
          title="Total Students" 
          value={courses.reduce((acc, course) => acc + (course.studentCount || 0), 0)} 
          icon={Users} 
          colorClass="text-brand-blue" 
        />
        <StatCard 
          title="Revenue" 
          value={`$${courses.reduce((acc, course) => acc + ((course.studentCount || 0) * (course.price || 0)), 0).toFixed(2)}`} 
          icon={DollarSign} 
          colorClass="text-emerald-500" 
        />
      </div>

      <div className="flex gap-4 border-b border-slate-700 mb-6">
        <button 
          onClick={() => setActiveTab('courses')}
          className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'courses' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          My Courses
        </button>
        <button 
          onClick={() => setActiveTab('assignments')}
          className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'assignments' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Assignments to Grade
          {submissions.filter(s => s.status === 'pending').length > 0 && (
            <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
              {submissions.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'courses' && (
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">My Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading 
              ? Array.from({ length: 4 }).map((_, i) => <CourseCard key={i} loading={true} />)
              : courses.map(course => (
                  <Link key={course._id} to={`/dashboard/courses/${course._id}/edit`}>
                    <CourseCard course={course} />
                  </Link>
                ))
            }
          </div>
          {!loading && courses.length === 0 && (
            <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50 border-dashed flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No courses created yet</h3>
              <p className="text-text-secondary mb-6">Start sharing your knowledge with the world.</p>
              <Link to="/dashboard/create-course">
                <Button variant="secondary">Create Your First Course</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">Student Submissions</h2>
          
          {gradingSubmission ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Grading: {gradingSubmission.student?.name}'s Submission</h3>
                  <p className="text-brand-purple font-medium">{gradingSubmission.assignmentTitle} - {gradingSubmission.course?.title}</p>
                </div>
                <Button variant="ghost" onClick={() => setGradingSubmission(null)}>Cancel</Button>
              </div>

              <div className="bg-slate-900 rounded-lg p-4 mb-6">
                {gradingSubmission.submissionUrl && (
                  <p className="mb-4">
                    <strong className="text-slate-400">Project Link:</strong>{' '}
                    <a href={gradingSubmission.submissionUrl} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">
                      {gradingSubmission.submissionUrl}
                    </a>
                  </p>
                )}
                {gradingSubmission.submissionText && (
                  <div>
                    <strong className="text-slate-400 mb-2 block">Text Submission:</strong>
                    <p className="text-slate-300 bg-slate-800 p-4 rounded whitespace-pre-wrap">{gradingSubmission.submissionText}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleGrade} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Score (Out of {gradingSubmission.maxScore})</label>
                  <input 
                    type="number" 
                    min="0"
                    max={gradingSubmission.maxScore}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-purple"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Feedback</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-purple"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback..."
                  />
                </div>
                <Button type="submit" variant="primary" disabled={submittingGrade}>
                  {submittingGrade ? 'Submitting Grade...' : 'Submit Grade'}
                </Button>
              </form>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50 border-dashed">
              <p className="text-text-secondary">No submissions have been made yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-slate-800 rounded-xl border border-slate-700">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Assignment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold">
                            {sub.student?.name?.charAt(0) || 'U'}
                          </div>
                          {sub.student?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">{sub.course?.title}</td>
                      <td className="px-6 py-4">{sub.assignmentTitle}</td>
                      <td className="px-6 py-4">
                        {sub.status === 'pending' ? (
                          <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border border-amber-500/20">Needs Grading</span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border border-emerald-500/20">Graded ({sub.score})</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {sub.status === 'pending' ? (
                          <Button 
                            variant="primary" 
                            className="py-1.5 px-3 text-xs" 
                            onClick={() => {
                              setGradingSubmission(sub);
                              setScore('');
                              setFeedback('');
                            }}
                          >
                            Grade Now
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            className="py-1.5 px-3 text-xs"
                            onClick={() => {
                              setGradingSubmission(sub);
                              setScore(sub.score);
                              setFeedback(sub.feedback);
                            }}
                          >
                            Edit Grade
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
