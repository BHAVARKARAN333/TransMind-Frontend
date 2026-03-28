import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipeline } from '../context/PipelineContext';
import StepIndicator from '../components/StepIndicator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function TranslationEditor() {
  const navigate = useNavigate();
  const { segments, ragResults, targetLang, targetLangName, tone, sourceLang, fileName, originalFileBase64, originalFormat, pipelineStep } = usePipeline();

  const [editorData, setEditorData] = useState([]); // [{sentence, translated, match_type, score, status}]
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showPreview, setShowPreview] = useState(false);

  // Route Guard: must have validated content
  useEffect(() => {
    if (pipelineStep === 'idle') {
      navigate('/upload');
    } else if (pipelineStep === 'extracted') {
      navigate('/source-validator');
    }
  }, []);

  // Load and translate all segments on mount
  useEffect(() => {
    if (ragResults.length > 0) {
      initTranslations();
    }
  }, [ragResults]);

  const initTranslations = async () => {
    setLoading(true);

    // 1. Initial setup: Show TM translation if available, else show Translating placeholder
    const initialData = ragResults.map(r => ({
      sentence: r.sentence,
      translated: r.match_type === 'Exact Match' ? r.best_match_translation : '[ ⏳ Translating... ]',
      match_type: r.match_type === 'Exact Match' ? 'Exact Match' : 'Translating...',
      score: r.similarity_score,
      block_type: r.block_type,
      element_type: r.element_type,
      element_index: r.element_index,
      table_idx: r.table_idx,
      row_idx: r.row_idx,
      col_idx: r.col_idx,
      status: 'pending',
      needs_translation: r.match_type !== 'Exact Match'
    }));
    
    setEditorData(initialData);
    setLoading(false); // Enable UI immediately

    // 2. Extract uniquely needed sentences
    const newSentences = Array.from(new Set(initialData.filter(d => d.needs_translation).map(d => d.sentence)));
    if (newSentences.length === 0) return;

    // 2.5 Fetch active glossary to enforce terminology
    let activeGlossary = {};
    try {
      const gRes = await fetch(`${API}/api/glossary/get`);
      const gData = await gRes.json();
      if (gData.terms) {
        gData.terms.filter(t => t.status === 'Active').forEach(t => {
          activeGlossary[t.source] = t.target;
        });
      }
    } catch (err) {
      console.warn("Failed to fetch glossary", err);
    }

    // 3. Process in chunks to avoid timeouts & show live progress
    // Gemini Free Tier: 15 Requests Per Minute (RPM) -> 1 req every 4 seconds
    const chunkSize = 20; // Increased chunk size to reduce total requests
    for (let i = 0; i < newSentences.length; i += chunkSize) {
      if (i > 0) {
        // 'Jugaad': Sleep for 4.5 seconds between chunks to bypass 429 Rate Limits
        await new Promise(resolve => setTimeout(resolve, 4500));
      }
      
      const chunk = newSentences.slice(i, i + chunkSize);
      try {
        const res = await fetch(`${API}/api/pipeline/translate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sentences: chunk, source_language: sourceLang, target_language: targetLang, tone, glossary: activeGlossary })
        });
        
        if (res.ok) {
          const data = await res.json();
          const chunkMap = {};
          (data.translations || []).forEach(t => { chunkMap[t.source] = { translated: t.translated, mode: t.mode }; });
          
          setEditorData(prev => prev.map(item => {
            if (item.needs_translation && chunkMap[item.sentence]) {
              const resObj = chunkMap[item.sentence];
              let mt = 'LLM New';
              let sc = 0.0;
              // If backend served it from persistent memory
              if (resObj.mode === 'memory') {
                mt = 'Exact Match';
                sc = 1.0;
              }
              return { 
                ...item, 
                translated: resObj.translated, 
                match_type: mt, 
                score: sc, 
                needs_translation: false 
              };
            }
            return item;
          }));
        }
      } catch (err) {
        console.error('Translation chunk failed:', err);
      }
    }
  };

  const handleEdit = (i, val) => {
    setEditorData(prev => prev.map((item, idx) => idx === i ? { ...item, translated: val } : item));
  };

  const handleAccept = async (i) => {
    setEditorData(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'accepted' } : item));
    // Learning Loop: save accepted pair to memory with target language
    const item = editorData[i];
    try {
      await fetch(`${API}/api/similarity/add`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs: [{ source: item.sentence, translation: item.translated, target_lang: targetLangName || targetLang || '' }] })
      });
    } catch (e) { console.error(e); }
  };

  const handleReject = (i) => {
    setEditorData(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'rejected' } : item));
  };

  const handleDownload = async (targetFormat = originalFormat) => {
    const exportBlocks = editorData.filter(d => d.status !== 'rejected').map(d => ({
      type: d.block_type,
      text: d.sentence,
      translated_text: d.translated,
      element_type: d.element_type,
      element_index: d.element_index,
      table_idx: d.table_idx,
      row_idx: d.row_idx,
      col_idx: d.col_idx
    }));
    
    const res = await fetch(`${API}/api/pipeline/export`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks: exportBlocks, original_file_base64: originalFileBase64, original_format: originalFormat, target_format: targetFormat })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanFileName = fileName.replace(/\.[^/.]+$/, "");
    a.href = url; a.download = `Translated_${cleanFileName}.${targetFormat.toLowerCase()}`; a.click();
    URL.revokeObjectURL(url);
    setShowPreview(false);
    navigate('/');
  };

  const getMatchBadge = (type) => {
    if (type?.includes('Exact')) return { label: 'TM 100%', cls: 'bg-tertiary text-white' };
    if (type?.includes('Fuzzy')) return { label: 'FUZZY', cls: 'bg-primary text-white' };
    return { label: 'LLM NEW', cls: 'bg-secondary text-white' };
  };

  const approved = editorData.filter(d => d.status === 'accepted').length;
  const visibleData = filter === 'all' ? editorData : editorData.filter(d => {
    if (filter === 'pending') return d.status === 'pending';
    if (filter === 'approved') return d.status === 'accepted';
    if (filter === 'rejected') return d.status === 'rejected';
    if (filter === 'tm') return d.match_type?.includes('Exact');
    if (filter === 'fuzzy') return d.match_type?.includes('Fuzzy');
    if (filter === 'llm') return d.match_type?.includes('New');
    return true;
  });

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center h-16 px-8 border-b border-slate-100 dark:border-slate-800/50 shadow-sm ml-[240px]">
        <div className="flex flex-col">
          <h2 className="font-['Inter'] font-bold text-slate-900 dark:text-white leading-tight text-xl">{fileName || 'Translation Editor'}</h2>
          <span className="text-xs text-on-surface-variant/70 font-medium">EN → {targetLangName} · {tone} tone</span>
        </div>
        <div className="flex items-center gap-4">
          <StepIndicator />
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-primary tracking-wider uppercase">{approved} / {editorData.length} segments approved</span>
            <div className="w-40 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: editorData.length > 0 ? `${(approved / editorData.length) * 100}%` : '0%' }} />
            </div>
          </div>
          <button onClick={() => setShowPreview(true)} className="bg-gradient-to-b from-primary to-primary-container text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-base">preview</span> Preview & Export
          </button>
        </div>
      </header>

      <main className="ml-[240px] pt-16 flex flex-col relative h-screen">
        {/* Filter Toolbar */}
        <div className="bg-surface-container-low px-8 py-3 flex flex-wrap gap-4 items-center justify-between border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <div className="bg-primary-container/10 border border-primary-container/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-primary font-bold text-[11px] tracking-wide">
              {sourceLang.toUpperCase()} <span className="material-symbols-outlined text-xs">arrow_forward</span> {targetLang.toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap custom-scrollbar">
            {[
              ['all', `All(${editorData.length})`],
              ['pending', `Pending(${editorData.filter(d => d.status === 'pending').length})`],
              ['approved', `Approved(${approved})`],
              ['rejected', `Rejected(${editorData.filter(d => d.status === 'rejected').length})`],
              ['tm', 'TM Match'],
              ['fuzzy', 'Fuzzy'],
              ['llm', 'LLM New'],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`text-sm font-bold relative py-2 transition-colors ${filter === key ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                {label}
                {filter === key && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Segments List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface space-y-4 py-6 px-8 pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="font-semibold text-primary">Generating translations...</p>
            </div>
          ) : visibleData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">segment</span>
              <p>No segments match this filter.</p>
            </div>
          ) : visibleData.map((item, rawIdx) => {
            const idx = editorData.indexOf(item);
            const badge = getMatchBadge(item.match_type);
            return (
              <div key={idx} className={`flex items-start gap-4 transition-opacity ${item.status === 'rejected' ? 'opacity-40' : ''}`}>
                <span className="text-[11px] font-bold text-outline-variant mt-6 w-6 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                <div className="flex-1 flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row items-stretch min-h-[100px]">
                    {/* Source */}
                    <div className="flex-1 p-5 text-on-surface-variant leading-relaxed text-[15px]">{item.sentence}</div>
                    <div className="hidden lg:block w-[2px] bg-[#e2e8f0] self-stretch" />
                    {/* Translation */}
                    <div className="flex-1 p-5 bg-surface-container-lowest text-on-surface leading-relaxed text-[15px] relative">
                      <div className="absolute top-3 right-4">
                        <span className={`min-w-[70px] inline-flex items-center justify-center text-[11px] font-bold px-2 py-1 rounded-full tracking-tight uppercase ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      {item.status === 'accepted' ? (
                        <p>{item.translated}</p>
                      ) : (
                        <textarea
                          className="w-full bg-transparent resize-none border-none outline-none text-[15px] leading-relaxed text-on-surface mt-4"
                          rows={3}
                          value={item.translated}
                          onChange={e => handleEdit(idx, e.target.value)}
                          disabled={item.status !== 'pending'}
                        />
                      )}
                    </div>
                  </div>
                  {/* Action Row */}
                  <div className="bg-surface-container-lowest/50 border-t border-outline-variant/10 px-5 py-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      {item.match_type} · {Math.round(item.score * 100)}% similarity
                    </span>
                    {item.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleReject(idx)} className="p-1.5 text-error hover:bg-error/10 rounded-full transition-all" title="Reject">
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                        <button onClick={() => handleAccept(idx)} className="px-4 py-1.5 bg-tertiary text-white text-[11px] font-bold rounded-full shadow-sm hover:bg-tertiary-container transition-all">
                          Accept
                        </button>
                      </div>
                    ) : item.status === 'accepted' ? (
                      <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Accepted to Memory
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">cancel</span> Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-[240px] right-0 bg-surface-container-lowest border-t border-outline-variant/10 px-8 py-3 flex items-center justify-between z-40">
          <div className="text-[11px] font-medium text-on-surface-variant">
            Showing <span className="font-bold text-on-surface">{visibleData.length}</span> of <span className="font-bold text-on-surface">{editorData.length}</span> segments
          </div>
          <button onClick={() => setShowPreview(true)} className="px-6 py-2 bg-gradient-to-r from-primary to-tertiary text-white font-bold text-sm rounded-full shadow-md flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-base">preview</span> Preview & Export Document
          </button>
        </footer>

      </main>

      {/* ═══ SPLIT-SCREEN PREVIEW MODAL (outside main to cover sidebar) ═══ */}
      {showPreview && (
        <PreviewModal
          editorData={editorData}
          originalFileBase64={originalFileBase64}
          originalFormat={originalFormat}
          fileName={fileName}
          sourceLang={sourceLang}
          targetLangName={targetLangName}
          onDownload={handleDownload}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

function PreviewModal({ editorData, originalFileBase64, originalFormat, fileName, sourceLang, targetLangName, onDownload, onClose }) {
  const [previewLoading, setPreviewLoading] = useState(true);
  const [error, setError] = useState('');
  const [originalPdfUrl, setOriginalPdfUrl] = useState('');
  const [translatedPdfUrl, setTranslatedPdfUrl] = useState('');

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    renderDocuments();
    // Cleanup blob URLs on unmount
    return () => {
      if (originalPdfUrl) URL.revokeObjectURL(originalPdfUrl);
      if (translatedPdfUrl) URL.revokeObjectURL(translatedPdfUrl);
    };
  }, []);

  const renderDocuments = async () => {
    setPreviewLoading(true);
    setError('');
    try {
      const exportBlocks = editorData.filter(d => d.status !== 'rejected').map(d => ({
        type: d.block_type,
        text: d.sentence,
        translated_text: d.translated,
        element_type: d.element_type,
        element_index: d.element_index,
        table_idx: d.table_idx,
        row_idx: d.row_idx,
        col_idx: d.col_idx
      }));

      const res = await fetch(`${API}/api/pipeline/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: exportBlocks, original_file_base64: originalFileBase64, original_format: originalFormat })
      });

      if (res.ok) {
        const data = await res.json();
        // Convert base64 PDF to blob URLs for iframes
        const origBytes = Uint8Array.from(atob(data.original_pdf), c => c.charCodeAt(0));
        const origBlob = new Blob([origBytes], { type: 'application/pdf' });
        setOriginalPdfUrl(URL.createObjectURL(origBlob));

        const transBytes = Uint8Array.from(atob(data.translated_pdf), c => c.charCodeAt(0));
        const transBlob = new Blob([transBytes], { type: 'application/pdf' });
        setTranslatedPdfUrl(URL.createObjectURL(transBlob));
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Preview generation failed');
      }
    } catch (err) {
      console.error('Preview failed:', err);
      setError(err.message || 'Failed to render document');
    }
    setPreviewLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center" style={{ marginLeft: 0 }}>
      <div className="bg-white dark:bg-slate-900 w-[98vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">compare</span>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Document Preview</h3>
              <p className="text-xs text-slate-500">Side-by-side comparison — {fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onDownload('docx')} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm rounded-full shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-base">description</span> Download DOCX
            </button>
            <button onClick={() => onDownload('pdf')} className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm rounded-full shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-base">picture_as_pdf</span> Download PDF
            </button>
            <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></span>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer" title="Close">
              <span className="material-symbols-outlined text-xl text-slate-500">close</span>
            </button>
          </div>
        </div>

        {/* Split Screen */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Original */}
          <div className="flex-1 flex flex-col border-r border-slate-300 dark:border-slate-600">
            <div className="px-5 py-2.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">description</span> Original Document — {sourceLang}
              </span>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-200 dark:bg-slate-800">
              {previewLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                  <span className="w-8 h-8 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm font-medium">Generating PDF preview via MS Word...</p>
                </div>
              )}
              {originalPdfUrl && (
                <iframe src={originalPdfUrl} className="w-full h-full border-0" title="Original Document PDF" />
              )}
            </div>
          </div>

          {/* RIGHT: Translated */}
          <div className="flex-1 flex flex-col">
            <div className="px-5 py-2.5 bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800 shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">translate</span> Translated Document — {targetLangName}
              </span>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-200 dark:bg-slate-800">
              {previewLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                  <span className="w-8 h-8 border-3 border-green-300 border-t-green-600 rounded-full animate-spin" />
                  <p className="text-sm font-medium">Generating PDF preview via MS Word...</p>
                </div>
              )}
              {translatedPdfUrl && (
                <iframe src={translatedPdfUrl} className="w-full h-full border-0" title="Translated Document PDF" />
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 py-2 bg-red-50 text-red-600 text-sm border-t border-red-200">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
