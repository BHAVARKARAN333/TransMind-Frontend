import React from 'react';

export default function Dashboard() {
  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center h-16 px-8 ml-[240px] border-b border-slate-100 dark:border-slate-800/50 shadow-sm">
        <h2 className="font-['Inter'] text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button className="hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full p-2 transition-all duration-200">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button className="hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full p-2 transition-all duration-200">
              <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
            </button>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-900 px-4 transition-all">Support</button>
          <button className="bg-gradient-to-b from-primary to-primary-container text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
            New Project
          </button>
        </div>
      </header>

      <main className="ml-[240px] pt-24 pb-12 px-10 min-h-screen">
        <section className="mb-10">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tighter mb-1">Welcome back, Studio Alpha</h1>
          <p className="text-on-surface-variant text-lg font-medium opacity-80">You have 3 active projects</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_10px_40px_rgba(30,58,95,0.04)] transition-all hover:scale-[1.02] border-l-4 border-primary">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total Segments</p>
              <span className="material-symbols-outlined text-primary">segment</span>
            </div>
            <h3 className="text-3xl font-extrabold text-primary tracking-tight">245</h3>
            <div className="mt-2 text-[11px] text-primary/60 font-medium">Updated 12 mins ago</div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_10px_40px_rgba(30,58,95,0.04)] transition-all hover:scale-[1.02] border-l-4 border-tertiary">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">TM Leverage</p>
              <span className="material-symbols-outlined text-tertiary">memory</span>
            </div>
            <h3 className="text-3xl font-extrabold text-tertiary tracking-tight">67%</h3>
            <div className="w-full bg-surface-container-highest h-1.5 mt-3 rounded-full overflow-hidden">
              <div className="bg-tertiary h-full rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_10px_40px_rgba(30,58,95,0.04)] transition-all hover:scale-[1.02] border-l-4 border-secondary">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Time Saved</p>
              <span className="material-symbols-outlined text-secondary">timer</span>
            </div>
            <h3 className="text-3xl font-extrabold text-secondary tracking-tight">4.2 hrs</h3>
            <div className="mt-2 text-[11px] text-secondary/60 font-medium">+15% from last week</div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_10px_40px_rgba(30,58,95,0.04)] transition-all hover:scale-[1.02] border-l-4 border-[#f97316]">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cost Saved</p>
              <span className="material-symbols-outlined text-[#f97316]">payments</span>
            </div>
            <h3 className="text-3xl font-extrabold text-[#f97316] tracking-tight">Rs 420</h3>
            <div className="mt-2 text-[11px] text-[#f97316]/60 font-medium">Projected Monthly: Rs 1,850</div>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-xl overflow-hidden p-1 shadow-sm">
          <div className="flex justify-between items-center px-6 py-5">
            <h3 className="text-lg font-bold text-on-surface tracking-tight">Recent Projects</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              View All <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/50 text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.1em]">
                <tr>
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">TM Match%</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                <tr className="bg-surface-container-lowest hover:bg-white hover:shadow-md transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">description</span>
                      </div>
                      <span className="text-on-surface font-semibold">Insurance Contract Q4</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant">English→Spanish</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#79f792]/20 text-[#005320] uppercase tracking-wide">Done</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-on-surface">85%</span>
                      <div className="w-12 bg-slate-100 h-1 rounded-full">
                        <div className="bg-tertiary h-full rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant/70">12 Mar 2025</td>
                  <td className="px-6 py-5 text-right">
                    <button className="bg-slate-50 text-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors">View</button>
                  </td>
                </tr>

                <tr className="bg-surface-container-low/50 hover:bg-white hover:shadow-md transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary-container/10 flex items-center justify-center text-primary-container">
                        <span className="material-symbols-outlined text-[18px]">article</span>
                      </div>
                      <span className="text-on-surface font-semibold">Member Handbook v3</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant">English→French</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#b5d0fd]/30 text-[#003dab] uppercase tracking-wide">In Progress</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-on-surface">62%</span>
                      <div className="w-12 bg-slate-100 h-1 rounded-full">
                        <div className="bg-primary h-full rounded-full" style={{ width: '62%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant/70">15 Mar 2025</td>
                  <td className="px-6 py-5 text-right">
                    <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">Continue</button>
                  </td>
                </tr>

                <tr className="bg-surface-container-lowest hover:bg-white hover:shadow-md transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[18px]">gavel</span>
                      </div>
                      <span className="text-on-surface font-semibold">Regulatory Filing 2025</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant">English→German</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#ffdad6]/40 text-[#ba1a1a] uppercase tracking-wide">Review</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-on-surface">71%</span>
                      <div className="w-12 bg-slate-100 h-1 rounded-full">
                        <div className="bg-secondary h-full rounded-full" style={{ width: '71%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant/70">18 Mar 2025</td>
                  <td className="px-6 py-5 text-right">
                    <button className="bg-secondary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">Review</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,63,177,0.3)] hover:scale-110 active:scale-95 transition-all z-50 group">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        <span className="absolute right-full mr-4 bg-on-background text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Quick Analysis</span>
      </button>
    </>
  );
}
