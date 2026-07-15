import React, { useEffect } from 'react';
import { Button } from './Button';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isDestructive = false
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-[100] w-full max-w-[28rem] flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">{title}</h2>
          <div className="text-text-secondary leading-relaxed">
            {children}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-700/50 flex justify-end gap-3 bg-slate-900/50 rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant="primary" 
            className={isDestructive ? 'from-red-600 to-red-500 shadow-red-500/20 hover:shadow-red-500/40 focus-visible:ring-red-400' : ''}
            onClick={() => {
              if(onConfirm) onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
