import React, { useState, useEffect } from 'react';

export default function SimilarityTest() {
  const [sourceData, setSourceData] = useState('');
  const [translationData, setTranslationData] = useState('');
  
  const [inputSentence, setInputSentence] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Requirement: persistent memory array state
  const [memoryStore, setMemoryStore] = useState([]);
  
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Fetch true state from backend on mount so memory persists
  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/similarity/memory');
      if (res.ok) {
        const data = await res.json();
        setMemoryStore(data.pairs || []);
      }
    } catch (err) {
      console.error("Could not load persistent memory:", err);
    }
  };

  const handleAddMemory = async (manualSource = null, manualTranslation = null) => {
    const s = manualSource !== null ? manualSource : sourceData;
    const t = manualTranslation !== null ? manualTranslation : translationData;
    
    // Requirement 7: Prevent saving empty inputs
    if (!s.trim() || !t.trim()) {
      setFeedbackMsg('❌ Please enter both source and translation.');
      setTimeout(() => setFeedbackMsg(''), 3000);
      return;
    }
    
    // Requirement 7: Prevent duplicate entries (optional but good)
    const isDuplicate = memoryStore.some(pair => pair.source === s.trim() && pair.translation === t.trim());
    if (isDuplicate) {
      setFeedbackMsg('ℹ️ This pair already exists in memory.');
      setTimeout(() => setFeedbackMsg(''), 3000);
      return;
    }
    
    setLoading(true);
    try {
      const newPair = { source: s.trim(), translation: t.trim() };
      const pairs = [newPair];
        
      const res = await fetch('http://localhost:8000/api/similarity/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs }),
      });
      
      if (res.ok) {
        // Requirement 2: Push new object into memoryStore
        const updatedMemory = [...memoryStore, newPair];
        setMemoryStore(updatedMemory);
        
        // Requirement 2: Clear input fields after saving
        if (manualSource === null) {
          setSourceData('');
          setTranslationData('');
        }

        // Requirement 5: Debug Logging
        console.log("Saved pair:", updatedMemory);
        
        // Requirement 8: Visual Feedback
        setFeedbackMsg('✔ Pair saved to translation memory');
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg('❌ Error saving pair.');
    }
    setLoading(false);
  };

  const handleClearMemory = async () => {
    setLoading(true);
    try {
      // Requirement 6: Reset memoryStore = [], update UI count
      await fetch('http://localhost:8000/api/similarity/clear', { method: 'DELETE' });
      setMemoryStore([]);
      setResult(null);
      setFeedbackMsg('✔ Database cleared.');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCheckMatch = async () => {
    if (!inputSentence.trim()) return;
    setLoading(true);
    setFeedbackMsg('');
    try {
      // Requirement 5: Debug Logging
      console.log("Current memory:", memoryStore);
      
      const res = await fetch('http://localhost:8000/api/similarity/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: inputSentence }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getMatchTypeColor = (type) => {
    if (type.includes('Exact')) return 'bg-[#79f792]/20 text-[#005320] border-[#005320]/20';
    if (type.includes('Fuzzy')) return 'bg-[#b5d0fd]/30 text-[#003dab] border-[#003dab]/20';
    return 'bg-[#ffdad6]/40 text-[#ba1a1a] border-[#ba1a1a]/20';
  };

  const getConfidenceColor = (conf) => {
    if (conf === 'High') return 'text-[#005320] font-bold';
    if (conf === 'Medium') return 'text-primary font-bold';
    return 'text-error font-bold';
  };

  const handleAction = (actionType) => {
    if (actionType === 'exact') {
      handleAddMemory(result.input_sentence, result.best_match_translation);
    } else if (actionType === 'fuzzy') {
      const editedTranslation = window.prompt("Review and edit the fuzzy translation:", result.best_match_translation);
      if (editedTranslation !== null && editedTranslation.trim() !== '') {
        handleAddMemory(result.input_sentence, editedTranslation);
      }
    } else if (actionType === 'new') {
      const aiTranslation = `[AI Translated] ${result.input_sentence}`;
      handleAddMemory(result.input_sentence, aiTranslation);
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 shadow-sm flex justify-between items-center h-16 px-8 ml-[240px]">
        <h2 className="font-['Inter'] font-bold text-slate-900 dark:text-white text-xl">Decision-Based TM Engine</h2>
      </header>

      <main className="ml-[240px] pt-24 pb-12 px-12 min-h-screen">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h3 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Translation Memory Matcher</h3>
            <p className="text-on-surface-variant max-w-xl text-sm font-medium">Test the Decision-Based TM engine by pairing sources and translations.</p>
          </div>
          {/* Requirement 3: Count = memoryStore.length dynamically updates */}
          <div className="bg-surface-container text-primary font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined">memory</span>
            Memory Items: {memoryStore.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add to Memory Section */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_40px_rgba(30,58,95,0.06)] flex flex-col items-start border-l-4 border-primary">
            <h4 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">database</span>
              Store Knowledge Pair
            </h4>
            <p className="text-xs text-on-surface-variant mb-4">Add historical (Source, Translation) pairs to the database.</p>
            
            <textarea
              className="w-full bg-surface-container-low border-none rounded-t-lg focus:ring-2 focus:ring-primary/20 text-on-surface p-4 text-sm resize-none custom-scrollbar border-b border-outline-variant/10"
              rows={2}
              placeholder="Source Text (e.g., The patient reported a mild headache.)"
              value={sourceData}
              onChange={(e) => setSourceData(e.target.value)}
            />
            <textarea
              className="w-full bg-surface-container-low border-none rounded-b-lg focus:ring-2 focus:ring-primary/20 text-on-surface p-4 text-sm resize-none mb-4 custom-scrollbar"
              rows={2}
              placeholder="Target Translation (e.g., El paciente reportó un dolor de cabeza leve.)"
              value={translationData}
              onChange={(e) => setTranslationData(e.target.value)}
            />
            
            <div className="w-full flex justify-between gap-4 mt-auto">
              <button 
                onClick={handleClearMemory}
                disabled={loading}
                className="px-4 py-2 border border-outline-variant text-on-surface-variant font-bold text-xs rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2 cursor-pointer"
              >
                Clear Database
              </button>
              <button 
                onClick={() => handleAddMemory(null, null)}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm rounded-lg shadow hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">u_turn_right</span>
                Embed Pair
              </button>
            </div>
          </div>

          {/* Test Similarity Section */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_40px_rgba(30,58,95,0.06)] flex flex-col items-start border-l-4 border-tertiary">
            <h4 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">troubleshoot</span>
              Match New Segment
            </h4>
            <p className="text-xs text-on-surface-variant mb-4">Input a new sentence to get an AI Decision via similarity.</p>
            
            <textarea
              className="w-full bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-tertiary/20 text-on-surface p-4 text-sm resize-none mb-4 custom-scrollbar"
              rows={3}
              placeholder="Input new text here..."
              value={inputSentence}
              onChange={(e) => setInputSentence(e.target.value)}
            />
            
            <button 
              onClick={handleCheckMatch}
              disabled={loading || memoryStore.length === 0}
              className={`mt-auto w-full py-3 font-bold text-sm rounded-lg flex justify-center items-center gap-2 transition-all shadow cursor-pointer ${
                loading || memoryStore.length === 0 ? 'bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed shadow-none' : 'bg-tertiary text-white hover:bg-tertiary-container active:scale-95 shadow-tertiary/20 hover:shadow-lg'
              }`}
            >
              <span className="material-symbols-outlined text-lg">magic_button</span>
              Get AI Decision
            </button>
          </div>
        </div>

        {/* Feedback Message (Requirement 8) */}
        {feedbackMsg && (
          <div className={`mt-6 border px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 animate-fade-in shadow-sm ${feedbackMsg.includes('✔') || feedbackMsg.includes('ℹ️') ? 'bg-primary-container/20 border-primary/20 text-primary' : 'bg-error-container border-error/20 text-error'}`}>
            <span className="material-symbols-outlined">{feedbackMsg.includes('✔') ? 'check_circle' : feedbackMsg.includes('ℹ️') ? 'info' : 'error'}</span>
            {feedbackMsg}
          </div>
        )}

        {/* Results Panel */}
        {result && (
          <div className="mt-6 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10 animate-fade-in">
            <div className="flex justify-between items-start mb-6 border-b border-outline-variant/10 pb-4">
              <div>
                <h4 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                  AI Decision Engine
                </h4>
              </div>
              <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${getMatchTypeColor(result.match_type)}`}>
                {result.match_type}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Decision Flow Column */}
              <div className="lg:col-span-1 bg-surface-container-low p-5 rounded-lg border border-outline-variant/10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Similarity Score</p>
                    <p className="text-xl font-black text-on-surface">{Math.round(result.similarity_score * 100)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Confidence</p>
                    <p className={`text-sm ${getConfidenceColor(result.confidence)}`}>{result.confidence}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Recommended Action</p>
                    <p className="text-sm font-bold text-on-surface">{result.action}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-outline-variant/10 mt-4">
                  {result.match_type.includes('Exact') && (
                    <button onClick={() => handleAction('exact')} className="w-full bg-[#005320] text-white py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all flex justify-center items-center gap-2 shadow-sm cursor-pointer">
                      <span className="material-symbols-outlined text-sm">done_all</span> Use This Translation
                    </button>
                  )}
                  {result.match_type.includes('Fuzzy') && (
                    <button onClick={() => handleAction('fuzzy')} className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all flex justify-center items-center gap-2 shadow-sm cursor-pointer">
                      <span className="material-symbols-outlined text-sm">edit_document</span> Review & Edit
                    </button>
                  )}
                  {result.match_type.includes('New') && (
                    <button onClick={() => handleAction('new')} className="w-full bg-tertiary text-white py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all flex justify-center items-center gap-2 shadow-sm cursor-pointer">
                      <span className="material-symbols-outlined text-sm">translate</span> Translate with AI
                    </button>
                  )}
                </div>
              </div>

              {/* Data Comparisons */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Input Sequence</span>
                  <div className="bg-surface-container-low p-4 rounded-lg text-sm font-medium text-on-surface border border-outline-variant/10">
                    {result.input_sentence}
                  </div>
                </div>
                
                {result.best_match_source && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-1 block">Matched Source (from DB)</span>
                      <div className="bg-tertiary-container/10 p-4 rounded-lg text-sm font-medium text-on-surface border border-tertiary/20">
                        {result.best_match_source}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Stored Translation</span>
                      <div className="bg-primary-container/10 p-4 rounded-lg text-sm font-medium text-on-surface border border-primary/20 font-bold block">
                        {result.best_match_translation}
                      </div>
                    </div>
                  </div>
                )}
                {!result.best_match_source && (
                   <div className="bg-surface-container p-6 rounded-lg border border-dashed border-outline-variant/30 text-center text-on-surface-variant flex flex-col items-center">
                     <span className="material-symbols-outlined text-3xl mb-2 opacity-50">search_off</span>
                     <p className="text-sm font-bold">No suitable match found.</p>
                     <p className="text-xs">Proceed with AI Translation generation.</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* ═══ TRANSLATION MEMORY ITEMS (from memory.json) ═══ */}
        <TranslationMemoryViewer />
      </main>
    </>
  );
}

function TranslationMemoryViewer() {
  const [tmItems, setTmItems] = useState([]);
  const [tmLoading, setTmLoading] = useState(true);
  const [tmSearch, setTmSearch] = useState('');

  useEffect(() => {
    fetchTM();
  }, []);

  const fetchTM = async () => {
    setTmLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/translation-memory');
      if (res.ok) {
        const data = await res.json();
        setTmItems(data.items || []);
      }
    } catch (err) {
      console.error("Could not load translation memory:", err);
    }
    setTmLoading(false);
  };

  const filtered = tmSearch.trim()
    ? tmItems.filter(item =>
        item.source.toLowerCase().includes(tmSearch.toLowerCase()) ||
        item.translated.toLowerCase().includes(tmSearch.toLowerCase())
      )
    : tmItems;

  return (
    <div className="mt-10 bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_40px_rgba(30,58,95,0.06)] border border-outline-variant/10">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
          <div>
            <h4 className="text-lg font-extrabold text-on-surface">Persistent Translation Memory</h4>
            <p className="text-xs text-on-surface-variant">Stored translations from <code className="bg-surface-container px-1.5 py-0.5 rounded text-[10px] font-mono">memory.json</code> — reused automatically to skip API calls.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTM} className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer">
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh
          </button>
          <div className="bg-surface-container text-primary font-bold px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">storage</span>
            {tmItems.length} saved
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">search</span>
        <input
          type="text"
          placeholder="Search translations..."
          value={tmSearch}
          onChange={e => setTmSearch(e.target.value)}
          className="w-full bg-surface-container-low border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {tmLoading ? (
        <div className="flex items-center justify-center py-12 text-on-surface-variant gap-2">
          <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Loading memory...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-30">inventory_2</span>
          <p className="text-sm font-bold">{tmSearch ? 'No matching items found.' : 'No translations stored yet.'}</p>
          <p className="text-xs mt-1">Translate a document and translations will appear here automatically.</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-lg border border-outline-variant/10">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-high/50 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">#</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Source Text</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Translated Text</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Pair</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3 text-on-surface-variant font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3 text-on-surface font-medium">{item.source}</td>
                  <td className="px-4 py-3 text-primary font-bold">{item.translated}</td>
                  <td className="px-4 py-3">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                      {item.source_lang} → {item.target_lang}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
