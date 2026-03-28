import React from 'react';

export default function Analytics() {
  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center h-16 px-8 ml-[240px] shadow-sm border-b border-slate-100 dark:border-slate-800/50">
        <h2 className="font-['Inter'] text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h2>
        <div className="flex items-center gap-4">
          <button className="hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full p-2 transition-all duration-200">
            <span className="material-symbols-outlined text-slate-500">notifications</span>
          </button>
          <button className="hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full p-2 transition-all duration-200">
            <span className="material-symbols-outlined text-slate-500">help_outline</span>
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4">Support</button>
          <button className="bg-primary text-white px-6 py-2 rounded-full font-medium shadow-lg shadow-blue-900/10 hover:brightness-110 transition-all">New Project</button>
        </div>
      </header>

      <main className="ml-[240px] pt-24 px-8 pb-12 min-h-screen bg-surface">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h3 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">Analytics Dashboard</h3>
            <p className="text-on-surface-variant text-sm font-medium">Performance monitoring & TM efficiency metrics.</p>
          </div>
          <div className="relative">
            <button className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm text-sm font-medium">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Last 30 days
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_40px_rgba(30,58,95,0.06)] group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">analytics</span>
              </div>
            </div>
            <h4 className="text-4xl font-bold text-on-surface tracking-tighter mb-1">67%</h4>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">TM Leverage Rate</p>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_40px_rgba(30,58,95,0.06)] group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-tertiary/10 rounded-lg">
                <span className="material-symbols-outlined text-tertiary">timer</span>
              </div>
            </div>
            <h4 className="text-4xl font-bold text-on-surface tracking-tighter mb-1">4.2 hrs</h4>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Time Saved Today</p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_40px_rgba(30,58,95,0.06)] group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary">library_add</span>
              </div>
            </div>
            <h4 className="text-4xl font-bold text-on-surface tracking-tighter mb-1">18</h4>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">New TM Entries</p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_40px_rgba(30,58,95,0.06)] group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#f59e0b1a] rounded-lg">
                <span className="material-symbols-outlined text-[#f59e0b]">book</span>
              </div>
            </div>
            <h4 className="text-4xl font-bold text-on-surface tracking-tighter mb-1">34</h4>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Glossary Terms Used</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 mb-8">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-2xl p-8 shadow-[0_10px_40px_rgba(30,58,95,0.04)]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h5 className="text-xl font-bold text-on-surface tracking-tight">Translation Memory Leverage</h5>
                <p className="text-sm text-on-surface-variant">Cumulative efficiency from historical data</p>
              </div>
              <span className="text-2xl font-black text-primary tracking-tighter">67%</span>
            </div>
            <div className="relative h-4 bg-surface-container-highest rounded-full overflow-hidden mb-8">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary-container w-[67%]"></div>
            </div>
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div>
                  <p className="text-lg font-bold text-on-surface leading-tight">164</p>
                  <p className="text-xs text-on-surface-variant font-medium">segments from TM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-surface-container-highest"></div>
                <div>
                  <p className="text-lg font-bold text-on-surface leading-tight">81</p>
                  <p className="text-xs text-on-surface-variant font-medium">new LLM calls</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
