import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseCard } from '../components/CourseCard';
import api from '../lib/api';
import { Search } from 'lucide-react';

export const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');

  const CATEGORIES = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 
    'Data Science', 'Business', 'Marketing'
  ];

  useEffect(() => {
    const fetchUrl = `/courses?page=${page}&limit=8${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`;
    api.get(fetchUrl).then(res => {
      setCourses(res.data.data.courses || []);
      setTotalPages(res.data.data.pagination?.pages || 1);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [page, selectedCategory]);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-text-primary mb-3">Explore All Courses</h1>
          <p className="text-text-secondary text-lg">Find the perfect course to level up your skills.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-bg-secondary text-white placeholder-slate-400 focus:outline-none focus:bg-slate-800 focus:border-brand-purple transition-colors sm:text-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => { setSelectedCategory(''); setPage(1); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === '' 
              ? 'bg-brand-purple text-white' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat 
                ? 'bg-brand-purple text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <CourseCard key={i} loading={true} />)}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map(course => (
            <Link key={course._id} to={`/course/${course._id}`}>
              <CourseCard course={course} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <p className="text-xl text-text-primary mb-2">No courses found</p>
          <p className="text-text-secondary">Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700"
          >
            Previous
          </button>
          <span className="flex items-center text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
