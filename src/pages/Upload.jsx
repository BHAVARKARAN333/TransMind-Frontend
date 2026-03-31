import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipeline } from '../context/PipelineContext';
import StepIndicator from '../components/StepIndicator';
import { apiFetch } from '../utils/apiFetch';

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | uploading | extracting | segmenting | detecting_language | done | error
  const [liveBlocks, setLiveBlocks] = useState([]);
  const [segmentCount, setSegmentCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
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
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await apiFetch(`${API}/api/pipeline/extract`, {
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
      const segRes = await apiFetch(`${API}/api/pipeline/segment`, {
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
      const langRes = await apiFetch(`${API}/api/pipeline/detect-language`, {
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
    navigate('/app/source-validator');
  };

  const isProcessing = phase === 'uploading' || phase === 'extracting' || phase === 'segmenting' || phase === 'detecting_language';
  const headings = liveBlocks.filter(b => b.type === 'heading').length;
  const tables = liveBlocks.filter(b => b.type === 'table_cell').length;

  return (
    <div className="bg-slate-50 min-h-screen font-['Inter'] selection:bg-blue-200 selection:text-blue-900">
      
      {/* Sleek Enterprise Top Navbar */}
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex justify-between items-center h-20 px-10 ml-[240px] shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
             <span className="material-symbols-outlined text-blue-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
           </div>
           <h2 className="font-black text-slate-900 text-2xl tracking-tight">Upload Center</h2>
        </div>
        <StepIndicator />
      </header>

      {/* Main Content Area */}
      <main className="ml-[240px] pt-32 pb-16 px-10 max-w-[1400px] mx-auto min-h-screen animate-fade-in-up">
        
        <div className="mb-12">
          <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-3 leading-tight">
            Secure AI Translation Hub
          </h3>
          <p className="text-lg text-slate-500 max-w-2xl font-medium">
            Upload your DOCX or PDF files. Our military-grade engine extracts content, parses XML structure, and prepares it for intelligent LLM processing.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Left Column (Dropzone & Processing) */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* === NO FILE SELECTED: Massive Premium Dropzone === */}
            {!selectedFile && (
              <div className="bg-white rounded-[2rem] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200/60">
                <div
                  className={`relative rounded-3xl min-h-[400px] flex flex-col items-center justify-center p-12 transition-all duration-300 cursor-pointer overflow-hidden ${
                    isDragging 
                      ? 'bg-blue-50 border-2 border-blue-500 shadow-inner' 
                      : 'bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-100/50'
                  }`}
                  onDrop={(e) => { setIsDragging(false); handleFileDrop(e); }}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".docx,.pdf" className="hidden" onChange={handleFileDrop} />
                  
                  {/* Glowing background blob */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] pointer-events-none" />

                  <div className={`w-24 h-24 mb-8 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-xl relative z-10 ${
                    isDragging 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/40 scale-110' 
                      : 'bg-white shadow-slate-200 border border-slate-100'
                  }`}>
                    <span className={`material-symbols-outlined text-5xl transition-colors ${
                      isDragging ? 'text-white' : 'text-blue-600'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>backup</span>
                  </div>
                  
                  <h3 className="text-3xl font-black text-slate-900 mb-3 relative z-10">Drag & drop your files here</h3>
                  <p className="text-lg text-slate-500 font-medium relative z-10 mb-8">Supported formats: <strong className="text-slate-700">DOCX, PDF</strong>. Maximum size: <strong className="text-slate-700">25MB</strong>.</p>
                  
                  <button className="px-8 py-4 bg-white text-slate-800 font-bold border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all relative z-10 flex items-center gap-2">
                     <span className="material-symbols-outlined text-[20px]">folder_open</span>
                     Browse Files
                  </button>
                </div>

                {/* Trust Badges under Dropzone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 mt-4 opacity-70">
                   <div className="flex items-center gap-3 justify-center text-slate-600">
                     <span className="material-symbols-outlined text-blue-500">lock</span>
                     <span className="text-sm font-bold tracking-tight">Enterprise Encryption</span>
                   </div>
                   <div className="flex items-center gap-3 justify-center text-slate-600 border-x border-slate-200">
                     <span className="material-symbols-outlined text-indigo-500">memory</span>
                     <span className="text-sm font-bold tracking-tight">GPT-4o Powered AI</span>
                   </div>
                   <div className="flex items-center gap-3 justify-center text-slate-600">
                     <span className="material-symbols-outlined text-emerald-500">format_align_left</span>
                     <span className="text-sm font-bold tracking-tight">Preserves XML Layout</span>
                   </div>
                </div>

                {errorMsg && <p className="mt-4 text-center text-sm text-red-600 font-bold p-3 bg-red-50 rounded-xl mx-4 shadow-sm">{errorMsg}</p>}
              </div>
            )}

            {/* === FILE SELECTED (Extraction & Progress) === */}
            {selectedFile && (
              <div className="space-y-6">
                
                {/* Premium File ID Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden flex items-center gap-6">
                  {/* Status glow behind card */}
                  {phase === 'done' && <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500"></div>}
                  {phase === 'error' && <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500"></div>}
                  {isProcessing && <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 animate-pulse"></div>}

                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm shrink-0 z-10 ${
                    phase === 'done' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    phase === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 
                    'bg-slate-50 text-blue-600 border border-slate-200'
                  }`}>
                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>
                      {phase === 'done' ? 'check_circle' : phase === 'error' ? 'cancel' : 'description'}
                    </span>
                  </div>
                  
                  <div className="flex-1 z-10">
                    <h4 className="text-xl font-black text-slate-900 truncate">{selectedFile.name}</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB • Document Container</p>
                  </div>

                  <div className="flex items-center gap-4 z-10 shrink-0">
                    {/* Status badge */}
                    {phase === 'idle' && <span className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">Waiting to Extract</span>}
                    {phase === 'done' && <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">Extraction Complete</span>}
                    {phase === 'error' && <span className="px-4 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">Failed</span>}
                    {isProcessing && <span className="px-4 py-2 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200 animate-pulse">Processing...</span>}

                    <button onClick={handleRemove} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors border border-slate-200">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                </div>

                {/* Extract Call to Action (Big Bold Button) */}
                {phase === 'idle' && (
                  <button onClick={handleExtract} className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_20px_40px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 w-0 group-hover:w-full transition-all duration-700 ease-in-out z-0 skew-x-12 opacity-0 group-hover:opacity-100"></div>
                    <span className="material-symbols-outlined text-3xl font-normal relative z-10">bolt</span>
                    <span className="relative z-10 tracking-tight">Extract & Process Document</span>
                  </button>
                )}

                {/* Loading / Processing Cinematic State */}
                {isProcessing && (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                       <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-1/2 animate-[progress_2s_infinite]"></div>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-8">
                       <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin flex-shrink-0"></div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            {phase === 'extracting' && "Extracting Structural XML..."}
                            {phase === 'segmenting' && "Segmenting Text Blocks..."}
                            {phase === 'detecting_language' && "Detecting Source Language via AI..."}
                          </h3>
                          <p className="text-slate-500 font-medium mt-1">
                            {liveBlocks.length} content blocks successfully extracted so far...
                          </p>
                       </div>
                    </div>

                    {/* Hacker-terminal style block feed */}
                    <div className="bg-slate-950 rounded-2xl p-6 h-64 overflow-y-auto font-mono text-sm border border-slate-800 shadow-inner custom-scrollbar relative">
                      <div className="absolute top-0 right-0 p-3 flex gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-500"></div>
                         <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                         <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {liveBlocks.length === 0 ? (
                           <p className="text-slate-500 italic animate-pulse">Initializing document parse routine...</p>
                        ) : (
                          liveBlocks.map((b, i) => (
                            <div key={i} className="flex gap-4 animate-fade-in-up">
                              <span className="text-slate-600 select-none">[{i.toString().padStart(4, '0')}]</span>
                              <span className={`${
                                b.type === 'heading' ? 'text-amber-400 font-bold' : 
                                b.type === 'table_cell' ? 'text-emerald-400' : 'text-blue-300'
                              } w-24 flex-shrink-0 uppercase text-xs tracking-widest`}>{b.type}</span>
                              <span className={`text-slate-300 ${b.type === 'heading' ? 'font-bold text-white' : ''} truncate flex-1`}>
                                {b.text}
                              </span>
                            </div>
                          ))
                        )}
                        {/* Fake cursor */}
                        <div className="w-2 h-4 bg-white animate-pulse mt-2"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium Bento Grid Stats (Extraction Finished) */}
                {phase === 'done' && (
                  <div className="space-y-6 animate-fade-in-up">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Extraction Insights</h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Stat 1 */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>dataset</span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Blocks</p>
                        <h4 className="text-3xl font-black text-slate-900">{liveBlocks.length}</h4>
                      </div>

                      {/* Stat 2 */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
                          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>short_text</span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sentences</p>
                        <h4 className="text-3xl font-black text-slate-900">{segmentCount}</h4>
                      </div>

                      {/* Stat 3 */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>title</span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Headings</p>
                        <h4 className="text-3xl font-black text-slate-900">{headings}</h4>
                      </div>

                      {/* Stat 4 */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
                          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>backup_table</span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Table Cells</p>
                        <h4 className="text-3xl font-black text-slate-900">{tables}</h4>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Box */}
                {phase === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex items-start gap-4">
                     <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                     <div>
                       <h4 className="text-lg font-bold text-red-800 tracking-tight mb-1">Extraction Process Failed</h4>
                       <p className="text-red-600 font-medium">{errorMsg}</p>
                       <button onClick={handleExtract} className="mt-4 px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm">
                         Retry Extraction
                       </button>
                     </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Right Column (Settings Sidebar) */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-slate-200 sticky top-[100px]">
              
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-600 text-[20px]">tune</span>
                 </div>
                 <h4 className="text-xl font-black text-slate-900 tracking-tight">Translation Params</h4>
              </div>

              <div className="space-y-6">
                
                {/* Detected Language (Disabled Look) */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Detected Source Language</label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-5 text-slate-500 font-bold flex items-center justify-between pointer-events-none opacity-80">
                    <span className="flex items-center gap-2">
                       {phase === 'done' ? sourceLangName : 'Waiting...'}
                    </span>
                    {phase === 'done' && <span className="material-symbols-outlined text-emerald-500 text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>}
                  </div>
                </div>

                {/* Target Language */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 text-blue-600">Translate To</label>
                  <div className="relative">
                    <select className="w-full bg-white border-2 border-slate-200 rounded-xl py-3.5 px-5 text-slate-900 font-bold appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                      value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                      {LANGUAGES.map(l => <option key={l.code} value={l.code} className="font-bold">{l.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                  {phase === 'done' && sourceLang === targetLang && (
                    <p className="text-[11px] font-bold text-red-500 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span> Target cannot match source.</p>
                  )}
                </div>

                {/* Tone Profile */}
                <div className="pb-4">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Tone Profile</label>
                  <div className="relative">
                    <select className="w-full bg-white border-2 border-slate-200 rounded-xl py-3.5 px-5 text-slate-900 font-bold appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                      value={tone} onChange={e => setTone(e.target.value)}>
                      {TONES.map(t => <option key={t} value={t.toLowerCase()} className="font-bold">{t}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleStart}
                  disabled={phase !== 'done' || sourceLang === targetLang}
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-2 group ${
                    phase === 'done' && sourceLang !== targetLang
                      ? 'bg-slate-900 text-white hover:bg-black hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  Initiate Validation
                  <span className={`material-symbols-outlined transition-transform ${phase === 'done' && sourceLang !== targetLang ? 'group-hover:translate-x-1' : ''}`}>arrow_forward</span>
                </button>
                
                {phase !== 'done' && (
                  <p className="text-xs font-bold text-slate-400 text-center mt-4">Extract document to enable validation.</p>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
