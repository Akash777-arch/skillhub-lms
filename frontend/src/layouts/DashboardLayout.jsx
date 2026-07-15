import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Library, Settings, Menu, X } from 'lucide-react';

export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/dashboard/courses', icon: Library },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-purple" />
          <span className="text-xl font-bold text-text-primary">SkillHub</span>
        </Link>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-brand-purple/10 text-brand-purple font-medium' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-bg-secondary border-r border-slate-700/50 fixed inset-y-0 z-drawer">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-drawer flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-64 bg-bg-secondary border-r border-slate-700/50 flex flex-col">
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-navbar h-16 bg-bg-glass backdrop-blur-md border-b border-slate-700/50 flex items-center px-4">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="text-text-secondary hover:text-text-primary focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-bold text-text-primary">Dashboard</span>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
