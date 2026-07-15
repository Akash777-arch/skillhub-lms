import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { User, Mail, Bell, Shield, Key } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Account Settings</h1>
        <p className="text-text-secondary">Manage your profile, notifications, and security preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'account', label: 'Account', icon: Mail },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-purple/10 text-brand-purple font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold text-text-primary mb-6">Public Profile</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-purple to-brand-blue rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <Button variant="secondary" className="mb-2">Change Avatar</Button>
                  <p className="text-xs text-text-muted">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full bg-bg-primary border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us a little about yourself..."
                    className="w-full bg-bg-primary border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold text-text-primary mb-6">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    defaultValue={user?.email}
                    className="w-full bg-bg-primary border border-slate-700 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed opacity-70"
                  />
                  <p className="text-xs text-brand-purple mt-2 cursor-pointer hover:underline">Request email change</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                  <div className="w-full bg-bg-primary border border-slate-700 rounded-xl px-4 py-3 text-white capitalize">
                    {user?.role || 'Student'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold text-text-primary mb-6">Email Notifications</h2>
              <div className="space-y-4">
                {['Course updates', 'New messages', 'Promotions and offers', 'New course recommendations'].map((item, i) => (
                  <label key={i} className="flex items-center justify-between p-4 bg-bg-primary rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                    <span className="text-text-primary">{item}</span>
                    <input type="checkbox" defaultChecked={i < 2} className="w-5 h-5 accent-brand-purple rounded bg-slate-700 border-slate-600" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold text-text-primary mb-6">Security & Password</h2>
              <div className="space-y-4">
                <Button variant="secondary" className="w-full flex justify-between items-center py-4 text-left">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-brand-purple" />
                    <span>Change Password</span>
                  </div>
                  <span className="text-xs text-text-muted">Last changed 30 days ago</span>
                </Button>
                
                <div className="pt-8 mt-8 border-t border-slate-700">
                  <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                  <p className="text-text-muted text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <Button variant="secondary" className="border-red-500/50 text-red-400 hover:bg-red-500/10">Delete Account</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
