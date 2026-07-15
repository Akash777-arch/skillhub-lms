import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />
};

const borders = {
  success: 'border-emerald-500/50',
  error: 'border-red-500/50',
  warning: 'border-amber-500/50',
  info: 'border-blue-500/50'
};

export const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`flex items-center gap-3 bg-slate-800 border ${borders[type]} rounded-lg shadow-xl p-4 max-w-sm w-full z-toast transition-all transform`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-medium text-text-primary">
        {message}
      </div>
      <button 
        onClick={onClose}
        className="text-text-muted hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
