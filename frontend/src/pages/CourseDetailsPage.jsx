import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { Button } from '../components/Button';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Loader2, ArrowLeft, Star, Users, Clock, Lock, PlayCircle, CheckCircle, Award } from 'lucide-react';

export const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [submissions, setSubmissions] = useState({}); // mapping assignmentId -> submission
  const [assignmentTexts, setAssignmentTexts] = useState({});
  const [assignmentUrls, setAssignmentUrls] = useState({});
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrollRes, reviewsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          isAuthenticated ? api.get(`/courses/${id}/enrollment-status`).catch(() => ({ data: { data: { isEnrolled: false } } })) : Promise.resolve({ data: { data: { isEnrolled: false } } }),
          api.get(`/courses/${id}/reviews`).catch(() => ({ data: { data: [] } }))
        ]);
        
        const courseData = courseRes.data.data;
        setCourse(courseData);
        setIsEnrolled(enrollRes.data?.data?.isEnrolled || false);
        setCompletedLessons(enrollRes.data?.data?.completedLessons || []);
        setProgress(enrollRes.data?.data?.progress || 0);
        setEnrollmentId(enrollRes.data?.data?.enrollmentId || null);
        setReviews(reviewsRes.data?.data || []);
        
        if (enrollRes.data?.data?.isEnrolled && courseData.assignments?.length > 0) {
          const subms = {};
          await Promise.all(
            courseData.assignments.map(async (a) => {
              try {
                const subRes = await api.get(`/courses/${id}/assignments/${a._id}/submission`);
                if (subRes.data.data) {
                  subms[a._id] = subRes.data.data;
                }
              } catch (e) {
                // Ignore 404s
              }
            })
          );
          setSubmissions(subms);
        }
        
        if (courseData.sections && courseData.sections.length > 0 && courseData.sections[0].lessons.length > 0) {
          setActiveLesson(courseData.sections[0].lessons[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      alert("Please log in or sign up to enroll.");
      return;
    }
    setEnrollLoading(true);
    try {
      const res = await api.post(`/courses/${id}/enroll`);
      setIsEnrolled(true);
      setEnrollmentId(res.data.data._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleLessonClick = (lesson) => {
    setActiveLesson(lesson);
  };

  const toggleComplete = async () => {
    if (!activeLesson || !isEnrolled) return;
    try {
      const res = await api.post(`/enrollments/${id}/lessons/${activeLesson._id}/complete`);
      setCompletedLessons(res.data.data.completedLessons);
      setProgress(res.data.data.progress);
    } catch (err) {
      console.error('Failed to toggle completion', err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await api.post(`/courses/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      // Prepend new review
      setReviews([{ ...res.data.data, user: user }, ...reviews]);
      setReviewComment('');
      
      // Update course rating stats in real time
      setCourse(prev => {
        if (!prev) return prev;
        const oldNum = prev.numReviews || 0;
        const oldAvg = prev.averageRating || 0;
        const newNum = oldNum + 1;
        const newAvg = ((oldAvg * oldNum) + reviewRating) / newNum;
        return {
          ...prev,
          numReviews: newNum,
          averageRating: Math.round(newAvg * 10) / 10
        };
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitAssignmentForm = async (e, assignmentId) => {
    e.preventDefault();
    setSubmittingAssignment(true);
    try {
      const res = await api.post(`/courses/${id}/assignments/${assignmentId}/submit`, {
        submissionText: assignmentTexts[assignmentId] || '',
        submissionUrl: assignmentUrls[assignmentId] || ''
      });
      setSubmissions({ ...submissions, [assignmentId]: res.data.data });
      alert('Assignment submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = activeLesson ? getYouTubeId(activeLesson.videoUrl) : null;

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
    </div>
  );

  if (error || !course) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Oops!</h2>
      <p className="text-text-secondary mb-6">{error || 'Course not found'}</p>
      <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
    </div>
  );

  const isCourseInstructor = user && course.instructor && 
    (course.instructor._id === user._id || course.instructor === user._id);
  const visibleAssignments = course.assignments ? course.assignments.filter(a => isCourseInstructor || a.isPublished) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-text-muted hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black aspect-video rounded-xl overflow-hidden relative">
            {activeLesson ? (
              (activeLesson.isFreePreview || isEnrolled) ? (
                ytId ? (
                  <iframe 
                    className="w-full h-full absolute inset-0"
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <VideoPlayer 
                    src={`${api.defaults.baseURL}/courses/${course._id}/lessons/${activeLesson._id}/stream`} 
                    poster={course.thumbnailUrl} 
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
                  <Lock className="w-12 h-12 text-slate-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Lesson Locked</h3>
                  <p className="text-slate-400 mb-6">Enroll in this course to access all lessons.</p>
                  <Button variant="primary" onClick={handleEnroll} disabled={enrollLoading}>
                    {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
                <PlayCircle className="w-12 h-12 text-slate-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Lessons Yet</h3>
                <p className="text-slate-400 mb-6">The instructor hasn't added any lessons to this course.</p>
                {!isEnrolled && (
                  <Button variant="primary" onClick={handleEnroll} disabled={enrollLoading}>
                    {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {isEnrolled && activeLesson && (
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700/50">
              <div>
                <h3 className="font-bold text-text-primary">{activeLesson.title}</h3>
                <p className="text-sm text-text-secondary">Mark this lesson as complete to track your progress.</p>
              </div>
              <Button 
                variant={completedLessons.includes(activeLesson._id) ? 'secondary' : 'primary'}
                onClick={toggleComplete}
                className="flex items-center gap-2"
              >
                <CheckCircle className={`w-4 h-4 ${completedLessons.includes(activeLesson._id) ? 'text-brand-purple' : ''}`} />
                {completedLessons.includes(activeLesson._id) ? 'Completed' : 'Mark as Complete'}
              </Button>
            </div>
          )}
          
            <div className="flex border-b border-slate-700 mt-8 mb-6 overflow-x-auto no-scrollbar">
              <button 
                className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              {isEnrolled && (
                <button 
                  className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'assignments' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setActiveTab('assignments')}
                >
                  Assignments
                </button>
              )}
              <button 
                className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'qna' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('qna')}
              >
                Q&A
              </button>
            </div>

            {activeTab === 'overview' && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-2 py-1 rounded">
                    {course.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-bold text-amber-500">{course.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-sm text-slate-500">({course.numReviews || 0} reviews)</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-text-primary mb-4">{course.title}</h1>
                <p className="text-text-secondary leading-relaxed mb-12">{course.description}</p>
                
                {/* Reviews Section */}
                <div className="border-t border-slate-700 pt-8">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">Student Reviews</h2>
                  
                  {isEnrolled && (
                    <form onSubmit={submitReview} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl mb-8">
                      <h4 className="font-bold text-white mb-4">Leave a review</h4>
                      <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star className={`w-6 h-6 ${reviewRating >= star ? 'fill-amber-500 text-amber-500' : 'text-slate-600'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you think of this course?"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-purple mb-4"
                        rows={3}
                      />
                      <Button type="submit" variant="primary" disabled={submittingReview}>
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </form>
                  )}

                  <div className="space-y-6">
                    {reviews.length > 0 ? reviews.map(review => (
                      <div key={review._id} className="border-b border-slate-800 pb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white">
                            {review.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{review.user?.name}</p>
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${review.rating > i ? 'fill-amber-500 text-amber-500' : 'text-slate-600'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 ml-auto">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm pl-13 ml-13">{review.comment}</p>
                      </div>
                    )) : (
                      <p className="text-slate-500 italic">No reviews yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && isEnrolled && (
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Course Assignments</h2>
                {visibleAssignments.length === 0 ? (
                  <p className="text-slate-500 italic">No assignments for this course yet.</p>
                ) : (
                  <div className="space-y-6">
                    {visibleAssignments.map(assignment => {
                      const submission = submissions[assignment._id];
                      return (
                        <div key={assignment._id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 relative">
                            {!assignment.isPublished && (
                              <span className="absolute top-4 right-4 bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                Draft
                              </span>
                            )}
                            <h3 className="text-xl font-bold text-white mb-2">{assignment.title}</h3>
                            <p className="text-slate-300 mb-4">{assignment.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-brand-purple font-medium mb-6">
                            <span>Max Score: {assignment.maxScore}</span>
                            {assignment.passingScore > 0 && (
                              <span>Passing Score: {assignment.passingScore}</span>
                            )}
                            {assignment.dueDate && (
                              <span className={new Date(assignment.dueDate) < new Date() ? 'text-red-400' : 'text-emerald-400'}>
                                Due: {new Date(assignment.dueDate).toLocaleString(undefined, {
                                  year: 'numeric', month: 'short', day: 'numeric', 
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>

                          {submission ? (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                              <h4 className="font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">Your Submission</h4>
                              {submission.status === 'graded' ? (
                                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-emerald-500">Graded</span>
                                    <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-full text-sm">
                                      Score: {submission.score} / {assignment.maxScore}
                                    </span>
                                  </div>
                                  <p className="text-slate-300 text-sm mt-2"><strong>Feedback:</strong> {submission.feedback || 'No written feedback provided.'}</p>
                                </div>
                              ) : (
                                <div className="mb-4 inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold rounded-full uppercase tracking-wider">
                                  Pending Grading
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                {submission.submissionUrl && (
                                  <p className="text-sm text-slate-400">
                                    <strong>Link:</strong> <a href={submission.submissionUrl} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">{submission.submissionUrl}</a>
                                  </p>
                                )}
                                {submission.submissionText && (
                                  <div>
                                    <strong className="text-sm text-slate-400 block mb-1">Text:</strong>
                                    <p className="text-slate-300 text-sm bg-slate-800 p-3 rounded">{submission.submissionText}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <form onSubmit={(e) => submitAssignmentForm(e, assignment._id)} className="border-t border-slate-700 pt-6 mt-4">
                              <h4 className="font-bold text-white mb-4">Submit Your Work</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm text-slate-400 mb-1">Project Link (Optional)</label>
                                  <input 
                                    type="url" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-purple"
                                    placeholder="https://github.com/..."
                                    value={assignmentUrls[assignment._id] || ''}
                                    onChange={(e) => setAssignmentUrls({...assignmentUrls, [assignment._id]: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-slate-400 mb-1">Text Submission (Optional)</label>
                                  <textarea 
                                    rows={4}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-purple"
                                    placeholder="Write your answer or explain your project here..."
                                    value={assignmentTexts[assignment._id] || ''}
                                    onChange={(e) => setAssignmentTexts({...assignmentTexts, [assignment._id]: e.target.value})}
                                  />
                                </div>
                                <Button type="submit" variant="primary" disabled={submittingAssignment}>
                                  {submittingAssignment ? 'Submitting...' : 'Submit Assignment'}
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qna' && (
              <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50 border-dashed">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Q&A System Coming Soon</h3>
                <p className="text-text-secondary">Instructor and student discussions will appear here in Phase 4.</p>
              </div>
            )}
          </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {!isEnrolled ? (
            <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
              <h3 className="text-2xl font-bold text-white mb-2">${course.price}</h3>
              <p className="text-text-muted text-sm mb-6">Full lifetime access</p>
              <Button variant="primary" className="w-full" onClick={handleEnroll} disabled={enrollLoading}>
                {enrollLoading ? 'Processing...' : 'Enroll Now'}
              </Button>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-6 text-center">
              <h3 className="text-lg font-bold text-emerald-400 mb-1">You are enrolled!</h3>
              <p className="text-sm text-text-muted">You have full access to this course.</p>
            </div>
          )}

          <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-text-primary">Course Content</h3>
              {isEnrolled && (
                <span className="text-sm font-medium text-brand-purple">{progress}% Complete</span>
              )}
            </div>

            {isEnrolled && (
              <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
                <div 
                  className="bg-brand-purple h-2 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            {isEnrolled && progress === 100 && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex flex-col items-center text-center">
                <Award className="w-8 h-8 text-emerald-500 mb-2" />
                <h4 className="font-bold text-white mb-1">Course Completed!</h4>
                <p className="text-xs text-slate-400 mb-3">You've earned a certificate of completion.</p>
                <Button variant="primary" className="w-full" onClick={() => navigate(`/certificate/${enrollmentId}`)}>
                  View Certificate
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {course.sections?.map((section, sIdx) => (
                <div key={section._id || sIdx}>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.lessons?.map((lesson, idx) => {
                      const isLocked = !isEnrolled && !lesson.isFreePreview;
                      const isActive = activeLesson?._id === lesson._id;
                      const isCompleted = completedLessons.includes(lesson._id);
                      
                      return (
                        <div 
                          key={lesson._id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700/50'
                          } ${isActive ? 'bg-slate-700 border-l-2 border-brand-purple' : ''}`}
                        >
                          <div className="flex items-center gap-3 truncate pr-2">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <PlayCircle className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-purple' : 'text-slate-400'}`} />
                            )}
                            <span className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-text-secondary'}`}>
                              {idx + 1}. {lesson.title}
                            </span>
                          </div>
                          {lesson.isFreePreview && !isEnrolled && (
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-brand-blue/20 text-brand-blue px-2 py-1 rounded">Preview</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white">
              {course.instructor?.name?.charAt(0) || 'I'}
            </div>
            <div>
              <p className="font-medium text-text-primary">{course.instructor?.name}</p>
              <p className="text-xs text-text-muted">Course Instructor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
