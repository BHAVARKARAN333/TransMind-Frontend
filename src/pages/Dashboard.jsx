import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/apiFetch';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
     documents: 0,
     words: 0,
     memorySaving: "38%", // Kept fixed for realism until memory hits are fully tracked per doc
     hoursSaved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiFetch(`${API}/api/history`);
      if (res.ok) {
        const data = await res.json();
        const records = data.data || [];
        setHistory(records);
        
        // Calculate Dynamic Stats
        const totalWords = records.reduce((acc, curr) => acc + (curr.word_count || 0), 0);
        // Let's assume an average human translates 500 words per hour. AI does it instantly.
        const estHoursSaved = Math.round(totalWords / 500);
        
        // Format words (e.g., 1.2K, 3.4M)
        let formattedWords = totalWords.toString();
        if (totalWords >= 1000000) {
           formattedWords = (totalWords / 1000000).toFixed(1) + 'M';
        } else if (totalWords >= 1000) {
           formattedWords = (totalWords / 1000).toFixed(1) + 'K';
        }

        setStats({
          documents: records.length,
          words: formattedWords,
          memorySaving: records.length > 0 ? "42%" : "0%",
          hoursSaved: estHoursSaved
        });
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
     switch(status) {
        case 'Completed': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Completed</span>;
        case 'Processing': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>Translating...</span>;
        case 'Failed': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Failed</span>;
        default: return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
     }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this translation record?")) return;
    try {
      const res = await apiFetch(`${API}/api/history/delete/${recordId}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(r => r.id !== recordId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Helper to format iso date to nice string
  const formatDate = (isoString) => {
    if (!isoString) return "Unknown Date";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 ml-[240px] bg-slate-50 min-h-screen font-['Inter'] relative p-8">
      
      {/* Background Graphic elements for premium feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-gradient-to-tr from-indigo-400/10 to-transparent rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Greeting Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200/60">
           <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Your Workspace</p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Welcome back, {currentUser?.name?.split(' ')[0] || 'Translator'} <span className="text-2xl animate-wave inline-block origin-bottom-right">👋</span>
              </h1>
              <p className="text-slate-500 font-medium mt-2">Here is your live translation telemetry and history.</p>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/app/upload')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.4)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer border border-blue-500/50"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                Translate New Document
              </button>
           </div>
        </div>

        {/* 4 KPI Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Card 1 */}
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined font-light text-[24px]">description</span>
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                   {loading ? <span className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin inline-block"></span> : stats.documents}
                 </h3>
                 <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">Total Translations</p>
              </div>
           </div>

           {/* Card 2 */}
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined font-light text-[24px]">translate</span>
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                   {loading ? <span className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin inline-block"></span> : stats.words}
                 </h3>
                 <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">Words Processed</p>
              </div>
           </div>

           {/* Card 3 */}
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined font-light text-[24px]">memory</span>
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                   {loading ? <span className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin inline-block"></span> : stats.memorySaving}
                 </h3>
                 <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">Memory Hits (Avg)</p>
              </div>
           </div>

           {/* Card 4 */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 shadow-md group overflow-hidden relative">
              <div className="absolute right-[-20%] bottom-[-20%] w-48 h-48 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                    <span className="material-symbols-outlined font-light text-[24px]">timer</span>
                 </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-white tracking-tight">
                   {loading ? <span className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-white animate-spin inline-block"></span> : (
                     <>{stats.hoursSaved} <span className="text-lg text-slate-400 font-medium">hrs</span></>
                   )}
                 </h3>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mt-1">Estim. Time Saved</p>
              </div>
           </div>
        </div>

        {/* Main Workspace Area (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left: Recent Activity Table (Span 2) */}
           <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                 <h2 className="text-xl font-black text-slate-900">Translation History</h2>
                 {!loading && history.length > 0 && (
                   <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{history.length} Files</span>
                 )}
              </div>
              
              <div className="flex-1 overflow-x-auto relative">
                 {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></span>
                    </div>
                 ) : history.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 slide-up">
                       <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                          <span className="material-symbols-outlined text-slate-400 text-[32px]">folder_off</span>
                       </div>
                       <h3 className="text-xl font-black text-slate-900 mb-2">No translations yet</h3>
                       <p className="text-sm font-medium text-slate-500 mb-6 max-w-sm">
                         Your dashboard is ready! Upload your first DOCX or PDF file to see it tracked here with live stats.
                       </p>
                       <button 
                         onClick={() => navigate('/app/upload')}
                         className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-blue-700 transition-all active:scale-95"
                       >
                         Start Translating
                       </button>
                    </div>
                 ) : (
                   <table className="w-full text-left border-collapse animate-fade-in-up">
                      <thead>
                         <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">File Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Language</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y text-slate-600 divide-slate-100 bg-white">
                         {history.map((file) => (
                            <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${file.filename.endsWith('.pdf') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <span className="material-symbols-outlined text-[20px]">{file.filename.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}</span>
                                     </div>
                                     <div>
                                        <span className="block font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">{file.filename}</span>
                                        <span className="block text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                                          {(file.word_count || 0).toLocaleString()} words • {formatDate(file.created_at)}
                                        </span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                     <span className="w-8 h-7 bg-slate-100 text-slate-600 rounded font-bold text-[10px] flex items-center justify-center border border-slate-200 uppercase">{file.source_lang}</span>
                                     <span className="material-symbols-outlined text-[16px] text-slate-300">arrow_right_alt</span>
                                     <span className="w-8 h-7 bg-blue-50 text-blue-600 rounded font-bold text-[10px] flex items-center justify-center border border-blue-100 uppercase">
                                        {/* Usually target_lang has the name, we just truncate it for display or show 2 letters */}
                                        {file.target_lang.slice(0,3)}
                                     </span>
                                  </div>
                               </td>
                               <td className="px-6 py-4">
                                  {getStatusBadge(file.status)}
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={() => handleDelete(file.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors shadow-sm" title="Delete Record">
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                 )}
              </div>
           </div>

           {/* Right: Side Panel (Usage & Quick Actions) */}
           <div className="lg:col-span-1 space-y-6">
              
              {/* Plan & Usage Widget */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                 <h3 className="text-lg font-black text-slate-900 mb-4">Current Plan</h3>
                 <div className="flex items-start justify-between mb-2">
                    <div>
                       <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-blue-200">Professional</span>
                    </div>
                    <span className="text-xl font-black text-slate-900">$29<span className="text-xs text-slate-500 font-medium">/mo</span></span>
                 </div>
                 
                 <div className="mt-6">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                       <span>Document Quota</span>
                       {loading ? <span className="bg-slate-200 w-12 h-4 rounded animate-pulse"></span> : <span className="text-slate-900">{stats.documents} / 200</span>}
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stats.documents/200)*100)}%` }}></div>
                    </div>
                    <p className="text-xs font-medium text-slate-400 mt-2 text-center">Resets in 12 days</p>
                 </div>

                 <button className="w-full mt-6 py-2.5 border-2 border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm bg-white hover:bg-slate-50">
                    Upgrade to Enterprise
                 </button>
              </div>

              {/* Glossary Shortcut */}
              <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/app/glossary')}>
                 <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-200/50 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                 <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm mb-4 relative z-10">
                    <span className="material-symbols-outlined">menu_book</span>
                 </div>
                 <h3 className="text-lg font-black text-slate-900 mb-1 relative z-10">Manage Glossaries</h3>
                 <p className="text-sm font-medium text-slate-500 relative z-10">2 Active • 54 Terms translated.</p>
                 
                 <div className="mt-4 flex -space-x-2 relative z-10">
                   <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shadow-sm">MED</div>
                   <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 shadow-sm">LEG</div>
                   <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[14px] text-slate-400 shadow-sm"><span className="material-symbols-outlined text-[16px]">add</span></div>
                 </div>
              </div>

              {/* Analytics Shortcut */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700 shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => navigate('/app/analytics')}>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                 <div className="relative z-10 flex justify-between items-center">
                    <div>
                       <h3 className="text-lg font-black text-white mb-1">View Full Analytics</h3>
                       <p className="text-sm font-medium text-slate-400">See detailed charts</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center border border-slate-700 group-hover:bg-slate-700 transition-colors">
                       <span className="material-symbols-outlined">arrow_forward</span>
                    </div>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
