import React, { useState } from 'react';
import Nav from '../components/Nav';

const CATEGORIES = ['All', 'Productivity', 'Coding', 'Finance', 'Life'];

const SacredInsights: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="min-h-screen bg-void text-slate-200">
      <Nav />

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-accent/40 blur-[150px]" />
        <div className="absolute top-[60%] left-[-5%] w-[40%] h-[40%] rounded-full bg-mint/20 blur-[150px]" />
      </div>

      <main className="pt-32 max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <header className="mb-12">
          <h1 className="text-5xl font-heading font-bold tracking-tight text-white mb-4">
            SACRED INSIGHTS
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl">
            Curated knowledge and discoveries for the NorthStar initiative.
          </p>
        </header>

        {/* Category Slider */}
        <div className="flex gap-4 mb-16 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                activeCategory === category
                  ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-violet-500/10'
                  : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Placeholder Area */}
        <div className="p-24 glass rounded-3xl border border-white/5 text-center">
          <p className="text-slate-400 font-medium">
            No insights found for category: {activeCategory}.<br />
            Upload and archival interface coming soon.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SacredInsights;
