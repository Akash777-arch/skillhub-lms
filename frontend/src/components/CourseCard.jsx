import React from 'react';
import { Star } from 'lucide-react';

export const CourseCard = ({ course, loading = false, progress }) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 w-full animate-pulse">
        <div className="w-full aspect-video bg-slate-700/50"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-5 bg-slate-700/50 rounded w-full"></div>
          <div className="h-5 bg-slate-700/50 rounded w-4/5"></div>
          <div className="h-4 bg-slate-700/50 rounded w-1/2 pt-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 hover:border-violet-500/50 transition-colors group cursor-pointer flex flex-col h-full">
      <div className="relative w-full aspect-video overflow-hidden">
        <img 
          src={course?.thumbnailUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'} 
          alt={course?.title || 'Course Thumbnail'} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-2 py-1 rounded">
            {course?.category || 'Uncategorized'}
          </span>
        </div>
        <h3 className="font-bold text-text-primary leading-tight mb-2 line-clamp-2">
          {course?.title || 'Untitled Course'}
        </h3>
        <p className="text-sm text-text-muted mt-auto mb-2">
          {course?.instructor?.name || course?.instructorName || 'Instructor'}
        </p>
        <div className="flex items-center gap-1 mt-auto">
          <span className="font-bold text-amber-500 text-sm mr-1">
            {course?.averageRating?.toFixed(1) || '0.0'}
          </span>
          <div className="flex text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${(course?.averageRating || 0) > i ? 'fill-amber-500' : 'fill-slate-700 text-slate-700'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-text-muted ml-1">
            ({course?.numReviews || 0})
          </span>
        </div>
        
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Progress</span>
              <span className="text-brand-purple font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div 
                className="bg-brand-purple h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
