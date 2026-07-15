import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { AuthModal } from '../components/AuthModal';

export const AppLayout = () => {
  const { isAuthenticated, user, checkAuth, logout, isLoading, openAuthModal } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      {/* Glassmorphism Navbar */}
      <nav className="sticky top-0 z-navbar bg-bg-glass backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-br from-brand-purple to-brand-blue rounded-lg group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary tracking-tight">SkillHub</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/courses" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Courses</Link>
              <Link to="/about" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">About</Link>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary hidden md:block">Welcome, {user?.name}</span>
                  <Link to="/dashboard">
                    <Button variant="secondary" className="px-4 py-2">Dashboard</Button>
                  </Link>
                  <button onClick={handleLogout} className="text-text-muted hover:text-red-400 transition-colors focus:outline-none">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => openAuthModal('login')}>Log in</Button>
                  <Button variant="primary" onClick={() => openAuthModal('register', 'student')}>Sign up</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-bg-secondary border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-text-muted text-sm">
          <p>&copy; {new Date().getFullYear()} SkillHub LMS. All rights reserved.</p>
        </div>
      </footer>
      
      <AuthModal />
    </div>
  );
};
