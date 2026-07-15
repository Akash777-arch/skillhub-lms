import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Loader2, ArrowLeft, Plus, Trash2, Video, GripVertical } from 'lucide-react';

export const EditCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        const data = res.data.data;
        // Verify instructor
        if (data.instructor._id !== user?._id) {
          navigate('/dashboard');
          return;
        }
        setCourse(data);
        setSections(data.sections || []);
        setAssignments(data.assignments || []);
      } catch (err) {
        setError('Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user, navigate]);

  const addSection = () => {
    setSections([...sections, { title: 'New Section', order: sections.length + 1, lessons: [] }]);
  };

  const updateSectionTitle = (index, title) => {
    const updated = [...sections];
    updated[index].title = title;
    setSections(updated);
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    // Reorder
    updated.forEach((s, i) => s.order = i + 1);
    setSections(updated);
  };

  const addLesson = (sectionIndex) => {
    const updated = [...sections];
    const newLesson = {
      title: 'New Lesson',
      videoUrl: '',
      isFreePreview: false,
      order: updated[sectionIndex].lessons.length + 1
    };
    updated[sectionIndex].lessons.push(newLesson);
    setSections(updated);
  };

  const updateLesson = (sectionIndex, lessonIndex, field, value) => {
    const updated = [...sections];
    updated[sectionIndex].lessons[lessonIndex][field] = value;
    setSections(updated);
  };

  const removeLesson = (sectionIndex, lessonIndex) => {
    const updated = [...sections];
    updated[sectionIndex].lessons = updated[sectionIndex].lessons.filter((_, i) => i !== lessonIndex);
    // Reorder
    updated[sectionIndex].lessons.forEach((l, i) => l.order = i + 1);
    setSections(updated);
  };

  const handleSaveCurriculum = async () => {
    setSaving(true);
    try {
      await api.put(`/courses/${id}/curriculum`, { sections, assignments });
      alert('Curriculum and Assignments saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addAssignment = () => {
    setAssignments([...assignments, { title: 'New Assignment', description: '', maxScore: 100, isPublished: true }]);
  };

  const updateAssignment = (index, field, value) => {
    const updated = [...assignments];
    updated[index][field] = value;
    setAssignments(updated);
  };

  const removeAssignment = (index) => {
    const updated = assignments.filter((_, i) => i !== index);
    setAssignments(updated);
  };

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
    </div>
  );

  if (error || !course) return (
    <div className="text-center py-12 text-red-500">{error}</div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Curriculum</h1>
            <p className="text-text-secondary">Manage sections, lessons, and assignments for {course?.title}</p>
          </div>
        </div>
        <Button variant="primary" onClick={handleSaveCurriculum} disabled={saving}>
          {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            {/* Section Header */}
            <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex items-center gap-4">
              <GripVertical className="text-slate-500 cursor-move" />
              <div className="flex-1">
                <input 
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                  className="bg-transparent border-none text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple rounded px-2 py-1 w-full"
                  placeholder="Section Title"
                />
              </div>
              <button onClick={() => removeSection(sIdx)} className="text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Lessons */}
            <div className="p-4 space-y-3">
              {section.lessons.map((lesson, lIdx) => (
                <div key={lIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <Video className="text-brand-purple shrink-0 hidden sm:block" />
                  
                  <div className="flex-1 space-y-3 w-full">
                    <input 
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(sIdx, lIdx, 'title', e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-brand-purple focus:outline-none w-full"
                      placeholder="Lesson Title"
                    />
                    <input 
                      type="text"
                      value={lesson.videoUrl}
                      onChange={(e) => updateLesson(sIdx, lIdx, 'videoUrl', e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-brand-purple focus:outline-none w-full"
                      placeholder="Video URL (e.g. https://example.com/video.mp4)"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={lesson.isFreePreview}
                        onChange={(e) => updateLesson(sIdx, lIdx, 'isFreePreview', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-brand-purple focus:ring-brand-purple focus:ring-offset-slate-900"
                      />
                      Free Preview
                    </label>
                    <button onClick={() => removeLesson(sIdx, lIdx)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => addLesson(sIdx)}
                className="flex items-center gap-2 text-sm font-medium text-brand-purple hover:text-brand-purple/80 transition-colors mt-4"
              >
                <Plus className="w-4 h-4" /> Add Lesson
              </button>
            </div>
          </div>
        ))}

        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
          <Button variant="secondary" onClick={addSection} className="flex items-center gap-2 mx-auto">
            <Plus className="w-5 h-5" /> Add Section
          </Button>
          <p className="text-sm text-slate-500 mt-2">Sections group your lessons together.</p>
        </div>
      </div>

      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Assignments</h2>
        <p className="text-text-secondary">Create projects or questions for your students to complete.</p>
      </div>

      <div className="space-y-6">
        {assignments.map((assignment, aIdx) => (
          <div key={aIdx} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg p-6 relative">
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={assignment.isPublished || false}
                  onChange={(e) => updateAssignment(aIdx, 'isPublished', e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                <span className={assignment.isPublished ? 'text-emerald-500 font-medium' : ''}>
                  {assignment.isPublished ? 'Published' : 'Draft'}
                </span>
              </label>
              <button onClick={() => removeAssignment(aIdx)} className="text-slate-500 hover:text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input 
                  type="text"
                  value={assignment.title}
                  onChange={(e) => updateAssignment(aIdx, 'title', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-brand-purple focus:outline-none w-full"
                  placeholder="Assignment Title"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description / Prompt</label>
                <textarea 
                  value={assignment.description}
                  onChange={(e) => updateAssignment(aIdx, 'description', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-brand-purple focus:outline-none w-full"
                  placeholder="What should the student do?"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Max Score</label>
                <input 
                  type="number"
                  value={assignment.maxScore}
                  onChange={(e) => updateAssignment(aIdx, 'maxScore', Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-brand-purple focus:outline-none w-32"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Passing Score (Optional)</label>
                <input 
                  type="number"
                  value={assignment.passingScore || 0}
                  onChange={(e) => updateAssignment(aIdx, 'passingScore', Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-brand-purple focus:outline-none w-32"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Due Date (Optional)</label>
                <input 
                  type="datetime-local"
                  value={assignment.dueDate ? new Date(new Date(assignment.dueDate).getTime() - new Date(assignment.dueDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateAssignment(aIdx, 'dueDate', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-brand-purple focus:outline-none w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
          <Button variant="secondary" onClick={addAssignment} className="flex items-center gap-2 mx-auto">
            <Plus className="w-5 h-5" /> Add Assignment
          </Button>
          <p className="text-sm text-slate-500 mt-2">Assignments are graded out of a maximum score.</p>
        </div>
      </div>
    </div>
  );
};
