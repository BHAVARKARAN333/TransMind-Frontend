import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipeline } from '../context/PipelineContext';
import StepIndicator from '../components/StepIndicator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LANGUAGES = [
  { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }, { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' }, { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' }, { code: 'zh-cn', name: 'Chinese' },
  { code: 'ru', name: 'Russian' }, { code: 'it', name: 'Italian' },
];
const TONES = ['Formal', 'Technical', 'Medical', 'Casual', 'Official'];

export default function Upload() {
  const navigate = useNavigate();
  const {
    setBlocks, setSegments, setFileName, setOriginalFileBase64,
    sourceLang, setSourceLang, sourceLangName, setSourceLangName,
    targetLang, setTargetLang, setTargetLangName,
    tone, setTone, setPipelineStep, resetPipeline,
    setOriginalFormat
  } = usePipeline();

  const [selectedFile, setSelectedFile] = useState(null);   // file object
  const [phase, setPhase] = useState('idle');                // idle | uploading | extracting | segmenting | done | error
  const [liveBlocks, setLiveBlocks] = useState([]);          // blocks appearing one-by-one
  const [segmentCount, setSegmentCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!file) return;
    
    const isValidFormat = file.name.endsWith('.docx') || file.name.endsWith('.pdf');
    if (!isValidFormat) {
      setErrorMsg('Only .docx and .pdf files are supported.');
      return;
    }
    // Show file info immediately
    setSelectedFile(file);
    setPhase('idle');
    setLiveBlocks([]);
    setSegmentCount(0);
    setErrorMsg('');
    resetPipeline();
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    setPhase('uploading');
    setLiveBlocks([]);
    setErrorMsg('');

    try {
      // 1) Upload + Extract
      setPhase('extracting');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(`${API}/api/pipeline/extract`, {
        method: 'POST', body: formData, signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      const allBlocks = data.blocks || [];

      // Stream blocks
      for (let i = 0; i < allBlocks.length; i++) {
        setLiveBlocks(prev => [...prev, allBlocks[i]]);
        if (i < 30) await new Promise(r => setTimeout(r, 60)); 
      }

      setBlocks(allBlocks);
      setFileName(selectedFile.name);
      setOriginalFileBase64(data.original_file_base64);
      setOriginalFormat(data.original_format || 'docx');

      // 2) Segment
      setPhase('segmenting');
      const segRes = await fetch(`${API}/api/pipeline/segment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: allBlocks })
      });
      if (!segRes.ok) throw new Error('Segmentation failed');
      const segData = await segRes.json();
      setSegments(segData.segments || []);
      setSegmentCount(segData.total || segData.segments?.length || 0);

      // 3) Detect Language using LLM
      setPhase('detecting_language');
      const sampleText = allBlocks.slice(0, 10).map(b => b.text).join(' ');
      const langRes = await fetch(`${API}/api/pipeline/detect-language`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText })
      });
      if (langRes.ok) {
        const langData = await langRes.json();
        setSourceLang(langData.language || 'en');
        setSourceLangName(langData.name || 'English');
      }

      setPipelineStep('extracted');
      setPhase('done');
    } catch (err) {
      console.error(err);
      if (err.name === 'AbortError') {
        setErrorMsg('Request timed out! Check if backend is running on port 8000.');
      } else {
        setErrorMsg(err.message || 'Unknown error. Make sure backend is running.');
      }
      setPhase('error');
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPhase('idle');
    setLiveBlocks([]);
    setSegmentCount(0);
    setErrorMsg('');
    resetPipeline();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStart = () => {
    setTargetLangName(LANGUAGES.find(l => l.code === targetLang)?.name || targetLang);
    navigate('/source-validator');
  };

  const isProcessing = phase === 'uploading' || phase === 'extracting' || phase === 'segmenting' || phase === 'detecting_language';
  const headings = liveBlocks.filter(b => b.type === 'heading').length;
  const tables = liveBlocks.filter(b => b.type === 'table_cell').length;

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm flex justify-between items-center h-16 px-8 ml-[240px]">
        <h2 className="font-['Inter'] font-bold text-slate-900 text-xl">Upload</h2>
        <StepIndicator />
      </header>

      <main className="ml-[240px] pt-24 pb-12 px-12 max-w-6xl mx-auto min-h-screen">
        <div className="mb-10">
          <h3 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Upload Document</h3>
          <p className="text-on-surface-variant max-w-xl">Upload a DOCX file to start the AI translation pipeline.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* === NO FILE SELECTED === */}
            {!selectedFile && (
              <div className="bg-surface-container-low p-8 rounded-xl">
                <div
                  className="border-2 border-dashed border-outline-variant rounded-lg bg-surface-container-highest/30 h-56 flex flex-col items-center justify-center transition-all hover:border-primary/50 hover:bg-surface-container-highest/50 cursor-pointer group"
                  onDrop={handleFileDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".docx,.pdf" className="hidden" onChange={handleFileDrop} />
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                  </div>
                  <p className="text-lg font-semibold text-on-surface">Drop DOCX or PDF here</p>
                  <p className="text-on-surface-variant text-sm mt-1">or click to browse</p>
                </div>
                {errorMsg && <p className="mt-3 text-sm text-error font-medium flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errorMsg}</p>}
              </div>
            )}
            {/* === FILE SELECTED (show info + extract button) === */}
            {selectedFile && (
              <div className="space-y-4">
                {/* File Card */}
                <div className={`bg-surface-container-lowest rounded-xl p-5 shadow-sm border-l-4 flex items-center gap-4 ${
                  phase === 'done' ? 'border-green-400' : phase === 'error' ? 'border-error' : 'border-primary'
                }`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    phase === 'done' ? 'bg-green-50' : phase === 'error' ? 'bg-error/10' : 'bg-primary/10'
                  }`}>
                    <span className="material-symbols-outlined text-2xl"
                      style={phase === 'done' ? { color: '#16a34a', fontVariationSettings: "'FILL' 1" } : phase === 'error' ? { color: '#dc2626' } : { color: '#1a56db' }}>
                      {phase === 'done' ? 'check_circle' : phase === 'error' ? 'error' : 'description'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-on-surface text-base">{selectedFile.name}</h4>
                    <p className="text-sm text-on-surface-variant">{(selectedFile.size / 1024).toFixed(1)} KB · DOCX</p>
                  </div>

                  {/* Status badge */}
                  {phase === 'idle' && (
                    <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">Ready</span>
                  )}
                  {isProcessing && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1.5 rounded-full uppercase animate-pulse flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
                      {phase === 'extracting' ? 'Extracting...' : phase === 'segmenting' ? 'Segmenting...' : 'Uploading...'}
                    </span>
                  )}
                  {phase === 'done' && (
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">✔ Parsed</span>
                  )}
                  {phase === 'error' && (
                    <span className="bg-error/10 text-error text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">Failed</span>
                  )}

                  <button onClick={handleRemove} className="text-outline hover:text-error transition-colors p-1" title="Remove">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Extract Button (only shown before extraction starts) */}
                {phase === 'idle' && (
                  <button onClick={handleExtract} className="w-full py-3.5 bg-gradient-to-r from-primary to-tertiary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 cursor-pointer">
                    <span className="material-symbols-outlined">bolt</span>
                    Extract & Process Document
                  </button>
                )}

                {/* Error display */}
                {phase === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 px-4 py-3 rounded-lg">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span className="flex-1">{errorMsg}</span>
                    <button onClick={handleExtract} className="underline font-bold text-xs">Retry</button>
                  </div>
                )}

                {/* Live Status Line */}
                {isProcessing && (
                  <div className="bg-surface-container-low rounded-lg px-4 py-3 flex items-center gap-3">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm font-medium text-on-surface">
                      {phase === 'extracting' && `Extracting content... ${liveBlocks.length} blocks found`}
                      {phase === 'segmenting' && `Segmenting ${liveBlocks.length} blocks into sentences...`}
                      {phase === 'detecting_language' && `Detecting document language via AI...`}
                    </span>
                  </div>
                )}

                {/* Done Stats */}
                {phase === 'done' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-6">
                    <span className="material-symbols-outlined text-green-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                    <div className="flex items-center gap-6 text-sm font-bold">
                      <span className="text-green-800">{liveBlocks.length} blocks</span>
                      <span className="text-green-800">{segmentCount} sentences</span>
                      <span className="text-green-700">{headings} headings</span>
                      <span className="text-green-700">{tables} table cells</span>
                    </div>
                  </div>
                )}

                {/* === LIVE BLOCKS LIST (streaming in) === */}
                {liveBlocks.length > 0 && (
                  <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10 max-h-72 overflow-y-auto custom-scrollbar">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">view_list</span>
                      Extracted Content ({liveBlocks.length} blocks)
                    </h4>
                    <div className="space-y-1">
                      {liveBlocks.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs py-1.5 border-b border-outline-variant/10 animate-fade-in">
                          <span className="text-on-surface-variant font-mono w-5 text-right flex-shrink-0">{i + 1}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                            b.type === 'heading' ? 'bg-primary/10 text-primary' :
                            b.type === 'table_cell' ? 'bg-tertiary/10 text-tertiary' :
                            'bg-surface-container text-on-surface-variant'
                          }`}>{b.type}</span>
                          <span className={`text-on-surface ${b.type === 'heading' ? 'font-bold' : ''}`}>{b.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* === SETTINGS SIDEBAR === */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_40px_rgba(30,58,95,0.06)] space-y-6 sticky top-24">
              <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/70 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">tune</span> Translation Settings
              </h4>
              <div className="space-y-4">
                {/* Detected Language (Read-only) */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Detected Language</label>
                  <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-3 px-4 text-on-surface font-medium flex items-center justify-between opacity-80 cursor-not-allowed">
                    <span>{sourceLangName}</span>
                    {phase === 'done' && <span className="material-symbols-outlined text-green-600 text-[18px]">verified</span>}
                  </div>
                </div>

                {/* Target Language (Dropdown) */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Target Language</label>
                  <select className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 font-medium"
                    value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                  {phase === 'done' && sourceLang === targetLang && (
                    <p className="text-xs text-error mt-1 font-medium">Target language cannot be the same as source.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Tone Profile</label>
                  <select className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 font-medium"
                    value={tone} onChange={e => setTone(e.target.value)}>
                    {TONES.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={phase !== 'done' || sourceLang === targetLang}
                className={`w-full py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
                  phase === 'done' && sourceLang !== targetLang
                    ? 'bg-gradient-to-b from-primary to-primary-container text-white hover:scale-[1.02] active:scale-[0.98] shadow-blue-900/20'
                    : 'bg-surface-container-highest text-on-surface-variant/50 cursor-not-allowed shadow-none'
                }`}
              >
                Start Validation
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              {phase !== 'done' && <p className="text-xs text-on-surface-variant text-center">Extract a DOCX file first.</p>}
            </div>
          </div>
        </div>
      </main>
      <div className="fixed top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
    </>
  );
}
