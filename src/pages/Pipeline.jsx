import React, { useState, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PHASES = [
  { id: 1, name: 'Upload & Extract', icon: 'upload_file' },
  { id: 2, name: 'Segment Sentences', icon: 'segment' },
  { id: 3, name: 'Detect Language', icon: 'language' },
  { id: 4, name: 'RAG Similarity', icon: 'search' },
  { id: 5, name: 'Decision Engine', icon: 'psychology' },
  { id: 6, name: 'LLM Translation', icon: 'translate' },
  { id: 7, name: 'Translation Editor', icon: 'edit_document' },
  { id: 8, name: 'Learning Loop', icon: 'school' },
  { id: 9, name: 'Document Preview', icon: 'preview' },
  { id: 10, name: 'Export DOCX', icon: 'download' },
];

const MatchBadge = ({ type }) => {
  const c = type?.includes('Exact') ? 'bg-green-100 text-green-800' :
            type?.includes('Fuzzy') ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800';
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c}`}>{type}</span>;
};

const PhaseHeader = ({ phase, active, complete }) => (
  <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
    active ? 'border-primary bg-primary/5' : complete ? 'border-green-300 bg-green-50/50' : 'border-outline-variant/30 bg-surface-container-lowest'
  }`}>
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
      complete ? 'bg-green-500 text-white' : active ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
    }`}>
      {complete ? <span className="material-symbols-outlined text-sm">check</span> : phase.id}
    </div>
    <div>
      <p className={`font-bold text-sm ${active ? 'text-primary' : complete ? 'text-green-700' : 'text-on-surface-variant'}`}>
        Phase {phase.id}: {phase.name}
      </p>
    </div>
    <span className={`material-symbols-outlined ml-auto ${active ? 'text-primary' : complete ? 'text-green-500' : 'text-outline-variant/50'}`}>
      {phase.icon}
    </span>
  </div>
);

export default function Pipeline() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [completed, setCompleted] = useState(new Set());

  // Phase 1
  const [blocks, setBlocks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Phase 2
  const [segments, setSegments] = useState([]);

  // Phase 3
  const [detectedLang, setDetectedLang] = useState(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [supportedLangs, setSupportedLangs] = useState([]);

  // Phase 4+5
  const [ragResults, setRagResults] = useState([]);

  // Phase 6
  const [translations, setTranslations] = useState([]);
  const [tone, setTone] = useState('formal');
  const [translating, setTranslating] = useState(false);

  // Phase 7
  const [editedTranslations, setEditedTranslations] = useState([]);
  const [accepted, setAccepted] = useState({});
  const [rejected, setRejected] = useState({});

  // Phase 8
  const [learnedCount, setLearnedCount] = useState(0);

  const completePhase = (phaseId) => {
    setCompleted(prev => new Set([...prev, phaseId]));
    setCurrentPhase(phaseId + 1);
  };

  // ── Phase 1: Upload & Extract ───────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/api/pipeline/extract`, { method: 'POST', body: formData });
      const data = await res.json();
      setBlocks(data.blocks || []);
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  // ── Phase 2: Segment ───────────────────────────────────
  const handleSegment = async () => {
    const res = await fetch(`${API}/api/pipeline/segment`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks })
    });
    const data = await res.json();
    setSegments(data.segments || []);
    completePhase(2);
  };

  // ── Phase 3: Detect Language ────────────────────────────
  const handleDetectLanguage = async () => {
    const sampleText = segments.slice(0, 5).map(s => s.sentence).join(' ');
    const res = await fetch(`${API}/api/pipeline/detect-language`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sampleText })
    });
    const data = await res.json();
    setDetectedLang(data);
    setSourceLang(data.code);
    setSupportedLangs(data.supported_languages || []);
    completePhase(3);
  };

  // ── Phase 4+5: RAG + Decision ───────────────────────────
  const handleRunRag = async () => {
    const res = await fetch(`${API}/api/pipeline/run-rag`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks: segments })
    });
    const data = await res.json();
    setRagResults(data.results || []);
    completePhase(5);
  };

  // ── Phase 6: LLM Translate ──────────────────────────────
  const handleTranslate = async () => {
    setTranslating(true);
    // Only send sentences with no strong match to LLM (i.e., not an Exact Match)
    const toTranslate = ragResults
      .filter(r => r.match_type !== 'Exact Match')
      .map(r => r.sentence);

    const res = await fetch(`${API}/api/pipeline/translate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentences: toTranslate, source_language: sourceLang, target_language: targetLang, tone })
    });
    const data = await res.json();

    // Merge: reuse existing translations for exact/fuzzy, use LLM for new
    const llmMap = {};
    (data.translations || []).forEach(t => { llmMap[t.source] = t.translated; });

    const merged = ragResults.map(r => ({
      ...r,
      translated: r.best_match_translation || llmMap[r.sentence] || r.sentence,
      translation_source: r.best_match_translation ? r.match_type : `LLM (${data.translations?.[0]?.mode || 'mock'})`
    }));
    setTranslations(merged);
    setEditedTranslations(merged.map(m => m.translated));
    setTranslating(false);
    completePhase(6);
  };

  // ── Phase 7: Editor Actions ─────────────────────────────
  const handleAccept = (idx) => setAccepted(prev => ({ ...prev, [idx]: true }));
  const handleReject = (idx) => setRejected(prev => ({ ...prev, [idx]: true }));
  const handleEdit = (idx, newVal) => {
    const arr = [...editedTranslations];
    arr[idx] = newVal;
    setEditedTranslations(arr);
  };

  // ── Phase 8: Learning Loop ──────────────────────────────
  const handleLearn = async () => {
    const pairs = translations
      .filter((_, i) => accepted[i] && !rejected[i])
      .map((t, i) => ({ source: t.sentence, translation: editedTranslations[i] }));
    
    if (pairs.length === 0) return;
    await fetch(`${API}/api/similarity/add`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairs })
    });
    setLearnedCount(pairs.length);
    completePhase(8);
    completePhase(9);
  };

  // ── Phase 10: Export ────────────────────────────────────
  const handleExport = async () => {
    const exportBlocks = translations.map((t, i) => ({
      type: t.block_type,
      text: t.sentence,
      translated_text: editedTranslations[i]
    }));
    const res = await fetch(`${API}/api/pipeline/export`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks: exportBlocks })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translated_document.docx';
    a.click();
    URL.revokeObjectURL(url);
    completePhase(10);
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm flex items-center h-16 px-8 ml-[240px] gap-4">
        <h2 className="font-['Inter'] font-bold text-slate-900 text-xl">AI Translation Pipeline</h2>
        <div className="flex gap-2 ml-auto">
          {PHASES.map(p => (
            <div key={p.id} className={`w-2.5 h-2.5 rounded-full transition-all ${completed.has(p.id) ? 'bg-green-500' : currentPhase === p.id ? 'bg-primary' : 'bg-surface-container-high'}`} title={p.name} />
          ))}
        </div>
      </header>

      <main className="ml-[240px] pt-24 pb-16 px-10 max-w-6xl mx-auto min-h-screen space-y-4">
        <h3 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">Document Translation Wizard</h3>
        <p className="text-on-surface-variant text-sm mb-8">Complete each phase sequentially. Each checkpoint validates the output before proceeding.</p>

        {/* ── PHASE 1 ── */}
        <PhaseHeader phase={PHASES[0]} active={currentPhase === 1} complete={completed.has(1)} />
        {currentPhase >= 1 && (
          <div className="ml-4 pl-6 border-l-2 border-outline-variant/20 space-y-3 py-3">
            <input ref={fileInputRef} type="file" accept=".docx" className="hidden" onChange={handleUpload} />
            <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">upload</span>
              {uploading ? 'Extracting...' : 'Upload DOCX File'}
            </button>
            {blocks.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-4 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> ✔ Checkpoint: {blocks.length} blocks extracted</p>
                {blocks.slice(0, 15).map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-1 border-b border-outline-variant/10">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${b.type === 'heading' ? 'bg-primary/10 text-primary' : b.type === 'table_cell' ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'}`}>{b.type}</span>
                    <span className="text-on-surface">{b.text}</span>
                  </div>
                ))}
                {blocks.length > 15 && <p className="text-xs text-on-surface-variant text-center pt-1">...and {blocks.length - 15} more</p>}
              </div>
            )}
            {blocks.length > 0 && !completed.has(1) && (
              <button onClick={() => completePhase(1)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_forward</span> Proceed to Phase 2
              </button>
            )}
          </div>
        )}

        {/* ── PHASE 2 ── */}
        <PhaseHeader phase={PHASES[1]} active={currentPhase === 2} complete={completed.has(2)} />
        {currentPhase >= 2 && (
          <div className="ml-4 pl-6 border-l-2 border-outline-variant/20 space-y-3 py-3">
            <button onClick={handleSegment} className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">segment</span> Run Segmentation
            </button>
            {segments.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-4 max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> ✔ Checkpoint: {segments.length} sentences segmented</p>
                {segments.map((s, i) => (
                  <div key={i} className="text-xs py-1 border-b border-outline-variant/10 flex gap-2">
                    <span className="text-on-surface-variant font-bold w-5 flex-shrink-0">{i+1}.</span>
                    <span className="text-on-surface">{s.sentence}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PHASE 3 ── */}
        <PhaseHeader phase={PHASES[2]} active={currentPhase === 3} complete={completed.has(3)} />
        {currentPhase >= 3 && (
          <div className="ml-4 pl-6 border-l-2 border-outline-variant/20 space-y-3 py-3">
            <button onClick={handleDetectLanguage} className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">language</span> Detect Language
            </button>
            {detectedLang && (
              <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-green-700 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> ✔ Checkpoint: Language detected</p>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Detected</p>
                    <p className="font-bold text-on-surface">{detectedLang.name} ({detectedLang.code})</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Source Override</p>
                    <select value={sourceLang} onChange={e=>setSourceLang(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded-lg px-2 py-1 text-sm text-on-surface">
                      {supportedLangs.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Target Language</p>
                    <select value={targetLang} onChange={e=>setTargetLang(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded-lg px-2 py-1 text-sm text-on-surface">
                      {supportedLangs.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PHASE 4 & 5 ── */}
        <PhaseHeader phase={PHASES[3]} active={currentPhase === 4} complete={completed.has(4)} />
        <PhaseHeader phase={PHASES[4]} active={currentPhase === 5} complete={completed.has(5)} />
        {currentPhase >= 4 && (
          <div className="ml-4 pl-6 border-l-2 border-outline-variant/20 space-y-3 py-3">
            <button onClick={handleRunRag} className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">search</span> Run RAG + Decision Engine
            </button>
            {ragResults.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-4 max-h-80 overflow-y-auto custom-scrollbar space-y-2">
                <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> ✔ Checkpoint: {ragResults.length} decisions made</p>
                {ragResults.map((r, i) => (
                  <div key={i} className="text-xs py-2 border-b border-outline-variant/10 flex gap-3 items-start">
                    <MatchBadge type={r.match_type} />
                    <div className="flex-1">
                      <p className="text-on-surface font-medium">{r.sentence}</p>
                      <p className="text-on-surface-variant mt-0.5">Score: <strong>{Math.round(r.similarity_score * 100)}%</strong> · {r.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PHASE 6 ── */}
        <PhaseHeader phase={PHASES[5]} active={currentPhase === 6} complete={completed.has(6)} />
        {currentPhase >= 6 && (
          <div className="ml-4 pl-6 border-l-2 border-outline-variant/20 space-y-3 py-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Translation Tone</p>
                <select value={tone} onChange={e=>setTone(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface">
                  {['formal','casual','technical','medical'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <button onClick={handleTranslate} disabled={translating} className="px-6 py-2.5 bg-tertiary text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all mt-5">
                <span className="material-symbols-outlined text-sm">translate</span>
                {translating ? 'Translating...' : `Translate to ${targetLang.toUpperCase()}`}
              </button>
            </div>
            {translations.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-4 max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> ✔ Checkpoint: {translations.length} sentences translated</p>
                {translations.slice(0, 5).map((t, i) => (
                  <div key={i} className="text-xs py-1 border-b border-outline-variant/10">
                    <p className="text-on-surface-variant">{t.sentence}</p>
                    <p className="text-primary font-bold mt-0.5">{t.translated}</p>
                    <span className="text-[10px] text-on-surface-variant">via {t.translation_source}</span>
                  </div>
                ))}
                {translations.length > 5 && <p className="text-xs text-on-surface-variant text-center">...and {translations.length - 5} more</p>}
              </div>
            )}
          </div>
        )}

        {/* ── PHASE 7 ── */}
        <PhaseHeader phase={PHASES[6]} active={currentPhase === 7} complete={completed.has(7)} />
        {currentPhase >= 7 && translations.length > 0 && (
          <div className="ml-4 pl-6 border-l-2 border-outline-variant/20 space-y-3 py-3">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">✔ Checkpoint: Review each translation</p>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {translations.map((t, i) => (
                <div key={i} className={`rounded-xl p-4 border transition-all ${accepted[i] ? 'border-green-300 bg-green-50/50' : rejected[i] ? 'border-red-200 bg-red-50/30 opacity-60' : 'border-outline-variant/20 bg-surface-container-lowest'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <MatchBadge type={t.match_type} />
                    <span className="text-[10px] text-on-surface-variant">{Math.round(t.similarity_score * 100)}% match</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Source</p>
                      <p className="text-sm text-on-surface">{t.sentence}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-primary font-bold uppercase mb-1">Translation</p>
                      <textarea
                        className="w-full bg-surface-container-low p-2 rounded-lg text-sm text-on-surface resize-none border border-outline-variant/20 focus:ring-1 focus:ring-primary"
                        rows={2}
                        value={editedTranslations[i] || ''}
                        onChange={e => handleEdit(i, e.target.value)}
                        disabled={accepted[i] || rejected[i]}
                      />
                    </div>
                  </div>
                  {!accepted[i] && !rejected[i] && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(i)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">check</span> Accept
                      </button>
                      <button onClick={() => handleReject(i)} className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">close</span> Reject
                      </button>
                    </div>
                  )}
                  {accepted[i] && <p className="text-xs font-bold text-green-700 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Accepted</p>}
                  {rejected[i] && <p className="text-xs font-bold text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">cancel</span> Rejected</p>}
                </div>
              ))}
            </div>
            {!completed.has(7) && (
              <button onClick={() => completePhase(7)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_forward</span> Confirm Reviews → Phase 8
              </button>
            )}
          </div>
        )}

        {/* ── PHASE 8 ── */}
        <PhaseHeader phase={PHASES[7]} active={currentPhase === 8} complete={completed.has(8)} />
        {currentPhase >= 8 && (
          <div className="ml-4 pl-6 border-l-2 border-outline-variant/20 space-y-3 py-3">
            <p className="text-xs text-on-surface-variant">Save accepted translations into the Translation Memory for future reuse.</p>
            <button onClick={handleLearn} className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">school</span> Save to Translation Memory
            </button>
            {learnedCount > 0 && (
              <p className="text-xs font-bold text-green-700 flex items-center gap-1 bg-green-50 px-4 py-2 rounded-lg border border-green-300">
                <span className="material-symbols-outlined text-sm">check_circle</span> ✔ Learned! {learnedCount} pairs saved to Translation Memory.
              </p>
            )}
          </div>
        )}

        {/* ── PHASE 9 ── */}
        <PhaseHeader phase={PHASES[8]} active={currentPhase === 9} complete={completed.has(9)} />
        {currentPhase >= 9 && (
          <div className="ml-4 pl-6 border-l-2 border-outline-variant/20 space-y-3 py-3">
            <p className="text-xs font-bold text-green-700 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> ✔ Checkpoint: Document reconstructed</p>
            <div className="bg-surface-container-low rounded-xl p-4 max-h-80 overflow-y-auto custom-scrollbar space-y-2 font-mono text-xs">
              {translations.map((t, i) => !rejected[i] && (
                <p key={i} className={`py-1 border-b border-outline-variant/10 ${t.block_type === 'heading' ? 'font-bold text-primary text-sm' : 'text-on-surface'}`}>
                  {editedTranslations[i] || t.translated}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE 10 ── */}
        <PhaseHeader phase={PHASES[9]} active={currentPhase === 10} complete={completed.has(10)} />
        {currentPhase >= 10 && (
          <div className="ml-4 pl-6 border-l-2 border-outline-variant/20 space-y-3 py-3">
            <button onClick={handleExport} className="px-8 py-3 bg-gradient-to-r from-primary to-tertiary text-white font-extrabold text-sm rounded-xl flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">download</span> Download Translated DOCX
            </button>
            {completed.has(10) && (
              <div className="bg-green-50 border border-green-300 rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-green-600">task_alt</span>
                <p className="font-extrabold text-green-800 mt-2 text-lg">Pipeline Complete!</p>
                <p className="text-green-700 text-sm">Your translated document has been exported successfully.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
