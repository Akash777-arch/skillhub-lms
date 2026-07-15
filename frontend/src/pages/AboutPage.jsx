import React from 'react';
import { BookOpen, Users, Trophy, Target } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-bg-primary animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6 tracking-tight">
            Empowering the next generation of <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">creators</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto">
            SkillHub was founded on a simple belief: world-class education should be accessible to everyone, anywhere. We partner with industry experts to bring you courses that matter.
          </p>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, title: '500k+', desc: 'Active Learners Worldwide' },
            { icon: BookOpen, title: '1,200+', desc: 'High-Quality Courses' },
            { icon: Trophy, title: 'Expert', desc: 'Industry-Leading Instructors' },
            { icon: Target, title: '95%', desc: 'Career Advancement Rate' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center mb-6">
                <stat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{stat.title}</h3>
              <p className="text-text-secondary">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-slate-800 to-bg-secondary border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                We're building the infrastructure for the future of learning. By combining interactive video technology, community-driven support, and practical project-based curriculums, we ensure that our students don't just consume content—they master skills.
              </p>
              <div>
                <Link to="/courses">
                  <Button variant="primary" className="px-8 py-3">Start Learning Today</Button>
                </Link>
              </div>
            </div>
            <div className="bg-slate-800/80 hidden lg:block relative min-h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" 
                alt="Students learning together" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
