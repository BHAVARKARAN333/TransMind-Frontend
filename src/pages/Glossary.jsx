import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Glossary() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ source: '', target: '', context: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const res = await fetch(`${API}/api/glossary/get`);
      const data = await res.json();
      setTerms(data.terms || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const currentGlossaryContextContext = {};

  const handleAddTerm = async (e) => {
    e.preventDefault();
    if (!form.source.trim() || !form.target.trim()) return;
    setAdding(true);

    try {
      const res = await fetch(`${API}/api/glossary/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchTerms();
        setForm({ source: '', target: '', context: '' });
      }
    } catch (err) {
      console.error(err);
    }
    setAdding(false);
  };

  const handleDeleteTerm = async (source) => {
    if (!window.confirm(`Delete '${source}' from glossary?`)) return;
    try {
      const res = await fetch(`${API}/api/glossary/delete/${encodeURIComponent(source)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchTerms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center h-16 px-8 ml-[240px] border-b border-slate-100 dark:border-slate-800/50 shadow-sm">
        <h1 className="font-['Inter'] text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Glossary</h1>
        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-surface-container-low px-4 py-1.5 rounded-full text-sm font-medium text-primary">
            <span>Global Terminology</span>
          </div>
        </div>
      </header>

      <main className="ml-[240px] pt-24 pb-12 px-10 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <h2 className="text-[2.25rem] font-extrabold tracking-tight text-on-surface leading-none mb-2">Glossary Manager</h2>
              <p className="text-on-surface-variant text-lg">Maintain precision across all translation segments by enforcing these rules in the LLM.</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 items-start">
            {/* ADD NEW TERM SECTION */}
            <section className="col-span-12 xl:col-span-4 sticky top-24">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold tracking-tight text-primary uppercase text-[0.75rem] tracking-[0.1em]">New Entry</h3>
                </div>
                
                <form onSubmit={handleAddTerm} className="space-y-5">
                  <div>
                    <label className="block text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Source Term (English) *</label>
                    <input 
                      type="text" 
                      required
                      value={form.source}
                      onChange={e => setForm({...form, source: e.target.value})}
                      className="w-full bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline-variant/60 py-3 px-4 transition-all" 
                      placeholder="e.g. deductible" 
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Target Term (Translation) *</label>
                    <input 
                      type="text" 
                      required
                      value={form.target}
                      onChange={e => setForm({...form, target: e.target.value})}
                      className="w-full bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline-variant/60 py-3 px-4 transition-all" 
                      placeholder="e.g. deducible" 
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Context/Usage Notes</label>
                    <textarea 
                      value={form.context}
                      onChange={e => setForm({...form, context: e.target.value})}
                      className="w-full bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline-variant/60 py-3 px-4 resize-none transition-all" 
                      rows={3} 
                      placeholder="Provide context..." />
                  </div>
                  <button type="submit" disabled={adding} className="w-full py-4 bg-tertiary-container text-white font-bold rounded-lg hover:bg-tertiary active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                    <span>{adding ? 'Saving...' : 'Add to Glossary'}</span>
                  </button>
                </form>
              </div>
            </section>

            {/* TERMS TABLE */}
            <section className="col-span-12 xl:col-span-8 bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/50 text-on-surface-variant text-[0.6875rem] font-bold uppercase tracking-[0.1em]">
                      <th className="px-6 py-5">Source Term</th>
                      <th className="px-6 py-5">Target Term</th>
                      <th className="px-6 py-5">Context</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {loading ? (
                       <tr><td colSpan="5" className="text-center py-10 text-on-surface-variant">Loading terms...</td></tr>
                    ) : terms.length === 0 ? (
                       <tr><td colSpan="5" className="text-center py-10 text-on-surface-variant">No terms in database. Add one to the left.</td></tr>
                    ) : (
                      terms.map((t, idx) => (
                        <tr key={idx} className="bg-surface-container-lowest hover:bg-white hover:shadow-md transition-all group">
                          <td className="px-6 py-5 font-semibold text-primary">{t.source}</td>
                          <td className="px-6 py-5 text-on-surface">{t.target}</td>
                          <td className="px-6 py-5 text-on-surface-variant text-sm italic">{t.context}</td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tertiary-container/10 text-tertiary">
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right space-x-3">
                            <button onClick={() => handleDeleteTerm(t.source)} className="text-on-surface-variant hover:text-error transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && terms.length > 0 && (
                <div className="px-8 py-5 bg-surface-container-high/30 flex items-center justify-between border-t border-outline-variant/10">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total: {terms.length} terms enforcing consistency</span>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
