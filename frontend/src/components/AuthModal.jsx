import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from './Button';
import { X } from 'lucide-react';

export const AuthModal = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { 
    isAuthModalOpen, 
    authModalMode, 
    authModalRole, 
    closeAuthModal, 
    openAuthModal, 
    login, 
    register, 
    isLoading, 
    error, 
    clearError 
  } = useAuthStore();

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authModalMode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({ ...formData, role: authModalRole });
      }
      closeAuthModal();
    } catch (err) {
      // Error is handled in store
    }
  };

  const switchMode = (newMode) => {
    openAuthModal(newMode, authModalRole);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary w-full max-w-md p-8 rounded-2xl shadow-2xl relative border border-slate-700">
        <button onClick={closeAuthModal} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6">
          {authModalMode === 'login' 
            ? 'Welcome Back' 
            : authModalRole === 'instructor' 
              ? 'Register as an Instructor' 
              : 'Create an Account'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-purple"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? 'Loading...' : authModalMode === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          {authModalMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => switchMode('register')} className="text-brand-purple hover:text-white transition-colors">
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => switchMode('login')} className="text-brand-purple hover:text-white transition-colors">
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
