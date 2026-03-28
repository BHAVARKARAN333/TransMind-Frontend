import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipeline } from '../context/PipelineContext';
import StepIndicator from '../components/StepIndicator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SourceValidator() {
  const navigate = useNavigate();
  const { segments, setSegments, blocks, fileName, setPipelineStep, pipelineStep, ragResults, setRagResults, targetLang, tone } = usePipeline();

  const [running, setRunning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [wantValidation, setWantValidation] = useState(null); // null = not chosen, true/false
  const [issues, setIssues] = useState({ spelling: 0, grammar: 0, punctuation: 0, consistency: 0, total: 0 });
  const [issueDetails, setIssueDetails] = useState([]);
  // Track which issues user has accepted/dismissed: Set of "segIdx-issIdx"
  const [resolvedIssues, setResolvedIssues] = useState(new Set());
  const [acceptedFixes, setAcceptedFixes] = useState(new Set());

  // Route Guard
  useEffect(() => {
    if (pipelineStep === 'idle') {
      navigate('/upload');
    }
  }, []);

  const runValidation = async () => {
    setValidating(true);
    try {
      const res = await fetch(`${API}/api/pipeline/validate-source`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments })
      });
      const data = await res.json();
      setIssues(data.stats || { spelling: 0, grammar: 0, punctuation: 0, consistency: 0, total: 0 });
      setIssueDetails(data.details || []);
      setValidated(true);
    } catch (err) {
      console.error(err);
    }
    setValidating(false);
  };

  const handleRunRAG = async () => {
    setRunning(true);
    try {
      const res = await fetch(`${API}/api/pipeline/run-rag`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: segments, target_language: targetLang || '' })
      });
      const data = await res.json();
      setRagResults(data.results || []);
      setPipelineStep('validated');
    } catch (err) {
      console.error(err);
    }
    setRunning(false);
  };

  const handleProceed = async () => {
    if (ragResults.length === 0) {
      await handleRunRAG();
    }
    navigate('/editor');
  };

  // Count only unresolved issues
  const unresolvedCount = issueDetails.reduce((acc, detail, di) => {
    const remaining = detail.issues.filter((_, ji) => !resolvedIssues.has(`${di}-${ji}`) && !acceptedFixes.has(`${di}-${ji}`));
    return acc + remaining.length;
  }, 0);
  const totalIssues = issues.total || 0;
  const fixedCount = acceptedFixes.size;
  const dismissedCount = resolvedIssues.size;
  const reusable = ragResults.filter(r => r.match_type.includes('Exact') || r.match_type.includes('Fuzzy')).length;
  const newRequired = ragResults.filter(r => r.match_type.includes('New')).length;

  // Accept a single fix — apply the AI's full corrected text to the segment
  const handleAcceptFix = (detailIdx, issueIdx) => {
    setAcceptedFixes(prev => new Set([...prev, `${detailIdx}-${issueIdx}`]));
    
    // Apply the full corrected_text to the segment (not just partial suggestion)
    const detail = issueDetails[detailIdx];
    if (detail?.corrected_text && detail?.segment_index !== undefined) {
      setSegments(prev => {
        const updated = [...prev];
        const segIdx = detail.segment_index;
        if (updated[segIdx]) {
          updated[segIdx] = { ...updated[segIdx], sentence: detail.corrected_text };
        }
        return updated;
      });
    }
  };
  // Dismiss a single issue
  const handleDismiss = (detailIdx, issueIdx) => {
    setResolvedIssues(prev => new Set([...prev, `${detailIdx}-${issueIdx}`]));
  };
  // Accept ALL remaining fixes — mark all as reviewed and apply corrected texts
  const handleAcceptAll = () => {
    const allKeys = new Set();
    const segmentUpdates = {}; // segIdx -> corrected_text

    issueDetails.forEach((detail, di) => {
      detail.issues.forEach((_, ji) => {
        allKeys.add(`${di}-${ji}`);
        // If there's a corrected text available, stage it for update
        if (detail.corrected_text && detail.segment_index !== undefined) {
          segmentUpdates[detail.segment_index] = detail.corrected_text;
        }
      });
    });
    setAcceptedFixes(allKeys);

    // Apply all corrected texts to segments
    if (Object.keys(segmentUpdates).length > 0) {
      setSegments(prev => {
        const updated = [...prev];
        for (const [segIdx, corrected_text] of Object.entries(segmentUpdates)) {
          const idx = parseInt(segIdx);
          if (updated[idx]) {
            updated[idx] = { ...updated[idx], sentence: corrected_text };
          }
        }
        return updated;
      });
    }
  };
  // Dismiss ALL remaining issues
  const handleDismissAll = () => {
    const allKeys = new Set();
    issueDetails.forEach((detail, di) => {
      detail.issues.forEach((_, ji) => {
        allKeys.add(`${di}-${ji}`);
      });
    });
    setResolvedIssues(allKeys);
  };

  const severityIcon = (sev) => {
    if (sev === 'high') return 'error';
    if (sev === 'medium') return 'warning';
    return 'info';
  };
  const severityColor = (sev) => {
    if (sev === 'high') return 'text-red-600';
    if (sev === 'medium') return 'text-amber-600';
    return 'text-blue-500';
  };
  const severityBg = (sev) => {
    if (sev === 'high') return 'bg-red-50 border-red-200';
    if (sev === 'medium') return 'bg-amber-50 border-amber-200';
    return 'bg-blue-50 border-blue-200';
  };
  const typeIcon = (type) => {
    if (type === 'spelling') return 'spellcheck';
    if (type === 'grammar') return 'edit_note';
    if (type === 'punctuation') return 'format_quote';
    if (type === 'consistency') return 'compare_arrows';
    return 'info';
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 shadow-sm flex justify-between items-center h-16 px-8 ml-[240px]">
        <h2 className="font-headline text-lg font-bold text-slate-900">Source Validator</h2>
        <div className="flex items-center gap-4">
          <StepIndicator />
          <button className="px-5 py-2 bg-gradient-to-b from-primary to-primary-container text-white text-sm font-semibold rounded-full shadow-md active:scale-95 transition-all cursor-pointer" onClick={handleProceed} disabled={running}>
            {running ? 'Analyzing...' : 'Proceed → Editor'}
          </button>
        </div>
      </header>

      <main className="ml-[240px] pt-16 min-h-screen bg-surface p-8">
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-4xl font-extrabold tracking-tight text-on-surface leading-tight">Source Quality Check</h3>
              <p className="text-on-surface-variant font-medium mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">description</span>
                {fileName || 'No file uploaded'}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">{segments.length} Segments</span>
              {validating ? (
                <span className="px-3 py-1 bg-blue-100 rounded-full text-[10px] font-bold tracking-wider text-blue-800 uppercase animate-pulse">AI Scanning...</span>
              ) : validated ? (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${totalIssues === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {totalIssues === 0 ? '✓ Clean Document' : `${totalIssues} Issues Found`}
                </span>
              ) : wantValidation === false ? (
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold tracking-wider text-slate-600 uppercase">Skipped</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            VALIDATION TOGGLE — Ask user if they want AI Quality Check
            ══════════════════════════════════════════════════════════════════ */}
        {wantValidation === null && !validating && !validated && (
          <div className="max-w-5xl mx-auto mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200/50 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-indigo-500 mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <h4 className="text-2xl font-extrabold text-slate-800 mb-2">AI Source Quality Check</h4>
              <p className="text-slate-600 max-w-lg mx-auto mb-6">
                Our AI will analyze your document for spelling, grammar, punctuation, and consistency issues. 
                This uses <span className="font-bold">~{Math.ceil(segments.length / 50)} API call{Math.ceil(segments.length / 50) > 1 ? 's' : ''}</span> from your Gemini quota.
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setWantValidation(true); runValidation(); }}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm rounded-full shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Yes, Run AI Check
                </button>
                <button 
                  onClick={() => setWantValidation(false)}
                  className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-full hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">skip_next</span>
                  Skip & Save API Calls
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards — only show after validation ran */}
        {(validated || validating) && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
            <div className="bg-surface-container-lowest clinical-shadow rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -mr-6 -mt-6" />
              <div className="relative z-10">
                <span className="text-red-500 font-extrabold text-4xl tracking-tighter">{validating ? '—' : issues.spelling}</span>
                <p className="text-on-surface-variant font-semibold mt-1 tracking-tight text-sm">Spelling</p>
                <div className="mt-3 h-1 w-10 bg-red-500 rounded-full" />
              </div>
            </div>
            <div className="bg-surface-container-lowest clinical-shadow rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-6 -mt-6" />
              <div className="relative z-10">
                <span className="text-amber-600 font-extrabold text-4xl tracking-tighter">{validating ? '—' : issues.grammar}</span>
                <p className="text-on-surface-variant font-semibold mt-1 tracking-tight text-sm">Grammar</p>
                <div className="mt-3 h-1 w-10 bg-amber-500 rounded-full" />
              </div>
            </div>
            <div className="bg-surface-container-lowest clinical-shadow rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-6 -mt-6" />
              <div className="relative z-10">
                <span className="text-blue-500 font-extrabold text-4xl tracking-tighter">{validating ? '—' : issues.punctuation}</span>
                <p className="text-on-surface-variant font-semibold mt-1 tracking-tight text-sm">Punctuation</p>
                <div className="mt-3 h-1 w-10 bg-blue-500 rounded-full" />
              </div>
            </div>
            <div className="bg-surface-container-lowest clinical-shadow rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-6 -mt-6" />
              <div className="relative z-10">
                <span className="text-purple-500 font-extrabold text-4xl tracking-tighter">{validating ? '—' : issues.consistency}</span>
                <p className="text-on-surface-variant font-semibold mt-1 tracking-tight text-sm">Consistency</p>
                <div className="mt-3 h-1 w-10 bg-purple-500 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-5xl mx-auto space-y-4">
          {ragResults.length === 0 ? (
            <>
              {/* AI Validation Results */}
              {validating && (
                <div className="bg-surface-container-lowest rounded-xl p-10 border border-outline-variant/10 text-center">
                  <span className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin inline-block mb-4"></span>
                  <p className="text-lg font-bold text-slate-700">AI is analyzing your document...</p>
                  <p className="text-sm text-slate-500 mt-1">Checking spelling, grammar, punctuation & consistency</p>
                </div>
              )}

              {validated && (
                <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-on-surface flex items-center gap-2">
                      {unresolvedCount === 0 && totalIssues > 0 ? (
                        <><span className="material-symbols-outlined text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span> All {totalIssues} Issues Resolved</>
                      ) : totalIssues === 0 ? (
                        <><span className="material-symbols-outlined text-green-500">verified</span> Document is Clean</>
                      ) : (
                        <><span className="material-symbols-outlined text-red-500">gpp_bad</span> {unresolvedCount} of {totalIssues} Issues Remaining</>
                      )}
                    </h4>
                    <div className="flex items-center gap-2">
                      {unresolvedCount > 0 && (
                        <>
                          <button onClick={handleAcceptAll} className="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 hover:bg-green-700 active:scale-95 transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-sm">done_all</span>
                            Accept All Fixes
                          </button>
                          <button onClick={handleDismissAll} className="px-4 py-2 bg-slate-200 text-slate-600 font-bold text-xs rounded-lg flex items-center gap-1.5 hover:bg-slate-300 active:scale-95 transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-sm">visibility_off</span>
                            Dismiss All
                          </button>
                        </>
                      )}
                      <button onClick={handleRunRAG} disabled={running} className="px-5 py-2 bg-tertiary text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">search</span>
                        {running ? 'Running Analysis...' : 'Run Similarity Analysis'}
                      </button>
                    </div>
                  </div>
                  {/* Resolution Summary Bar */}
                  {(fixedCount > 0 || dismissedCount > 0) && (
                    <div className="flex items-center gap-4 mb-4 py-2 px-4 bg-slate-50 rounded-lg border border-slate-200">
                      {fixedCount > 0 && (
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span> {fixedCount} Accepted
                        </span>
                      )}
                      {dismissedCount > 0 && (
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">do_not_disturb_on</span> {dismissedCount} Dismissed
                        </span>
                      )}
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-xs font-bold text-slate-600">{unresolvedCount} remaining</span>
                    </div>
                  )}

                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar space-y-4">
                    {issueDetails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 opacity-70">
                        <span className="material-symbols-outlined text-6xl text-green-500 mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                        <p className="text-lg font-bold text-green-700">No issues found!</p>
                        <p className="text-sm text-slate-500 mt-1">Your document passed all quality checks.</p>
                      </div>
                    ) : issueDetails.map((detail, di) => {
                      // Check if ALL issues in this segment are resolved
                      const allResolved = detail.issues.every((_, ji) => resolvedIssues.has(`${di}-${ji}`) || acceptedFixes.has(`${di}-${ji}`));
                      if (allResolved) return (
                        <div key={di} className="border rounded-xl overflow-hidden opacity-50 bg-green-50/30">
                          <div className="px-5 py-3 flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <span className="text-xs font-extrabold text-slate-400 bg-white px-2 py-1 rounded shadow-sm border">#{detail.segment_index + 1}</span>
                            <p className="text-sm text-green-700 font-medium">All issues resolved</p>
                          </div>
                        </div>
                      );
                      return (
                      <div key={di} className="border rounded-xl overflow-hidden">
                        {/* Segment Header */}
                        <div className="bg-slate-50 px-5 py-3 flex items-start gap-3 border-b">
                           <span className="text-xs font-extrabold text-slate-400 bg-white px-2 py-1 rounded shadow-sm border">#{detail.segment_index + 1}</span>
                           <p className="text-sm text-slate-700 italic leading-relaxed flex-1">"{detail.text}"</p>
                        </div>
                        {/* Issues for this segment */}
                        <div className="p-4 space-y-2.5">
                          {detail.issues.map((iss, ji) => {
                            const key = `${di}-${ji}`;
                            const isAccepted = acceptedFixes.has(key);
                            const isDismissed = resolvedIssues.has(key);
                            if (isDismissed) return null;
                            if (isAccepted) return (
                              <div key={ji} className="flex items-center gap-3 text-sm p-3 rounded-lg border bg-green-50 border-green-200">
                                <span className="material-symbols-outlined text-green-600 text-base">check_circle</span>
                                <span className="text-green-700 font-medium line-through opacity-70">{iss.message}</span>
                                <span className="ml-auto text-[10px] font-extrabold text-green-700 bg-green-200 px-2 py-0.5 rounded uppercase">Fixed</span>
                              </div>
                            );
                            return (
                            <div key={ji} className={`flex items-start gap-3 text-sm p-3 rounded-lg border ${severityBg(iss.severity)}`}>
                              <span className={`material-symbols-outlined text-base mt-0.5 ${severityColor(iss.severity)}`}>
                                {typeIcon(iss.type)}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                    iss.severity === 'high' ? 'bg-red-200 text-red-800' : 
                                    iss.severity === 'medium' ? 'bg-amber-200 text-amber-800' : 
                                    'bg-blue-200 text-blue-800'
                                  }`}>{iss.severity}</span>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${severityColor(iss.severity)}`}>{iss.type}</span>
                                </div>
                                <p className="text-slate-700 font-medium">{iss.message}</p>
                                {iss.suggestion && (
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs text-green-600">lightbulb</span>
                                    <span className="text-xs text-green-700 font-medium bg-green-50 px-2 py-1 rounded border border-green-200">
                                      Fix: {iss.suggestion}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {/* ACTION BUTTONS */}
                              <div className="flex flex-col gap-1.5 ml-2 flex-shrink-0">
                                <button onClick={() => handleAcceptFix(di, ji)} className="px-3 py-1.5 bg-green-600 text-white font-bold text-[10px] rounded-md flex items-center gap-1 hover:bg-green-700 active:scale-95 transition-all cursor-pointer" title="Accept this fix">
                                  <span className="material-symbols-outlined text-xs">check</span> Accept
                                </button>
                                <button onClick={() => handleDismiss(di, ji)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-500 font-bold text-[10px] rounded-md flex items-center gap-1 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer" title="Dismiss this issue">
                                  <span className="material-symbols-outlined text-xs">close</span> Dismiss
                                </button>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Show when user skipped validation */}
              {wantValidation === false && !validated && (
                <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">skip_next</span>
                      Validation Skipped — Extracted Segments ({segments.length})
                    </h4>
                    <div className="flex gap-2">
                      <button onClick={() => { setWantValidation(true); runValidation(); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-indigo-100 transition-all active:scale-95 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        Run AI Check Now
                      </button>
                      <button onClick={handleRunRAG} disabled={running} className="px-5 py-2 bg-tertiary text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">search</span>
                        {running ? 'Running...' : 'Run Similarity Analysis'}
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-1">
                    {segments.slice(0, 30).map((s, i) => (
                      <div key={i} className="flex gap-3 text-sm py-2 border-b border-outline-variant/10">
                        <span className="text-on-surface-variant font-bold w-6 text-xs flex-shrink-0">{i + 1}.</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 self-start ${s.block_type === 'heading' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>{s.block_type}</span>
                        <span className="text-on-surface">{s.sentence}</span>
                      </div>
                    ))}
                    {segments.length > 30 && <p className="text-xs text-on-surface-variant text-center pt-2">...and {segments.length - 30} more</p>}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* RAG Similarity Results */
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600">analytics</span>
                  Similarity Analysis Results
                </h4>
                <div className="flex gap-3">
                  <span className="text-[11px] px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold">{reusable} Reusable</span>
                  <span className="text-[11px] px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold">{newRequired} Need Translation</span>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                {ragResults.slice(0, 20).map((r, i) => (
                  <div key={i} className="flex gap-3 text-sm py-2 border-b border-outline-variant/10 items-start">
                    <span className="text-on-surface-variant font-bold w-6 text-xs flex-shrink-0">{i + 1}.</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 uppercase ${r.match_type.includes('Exact') ? 'bg-green-100 text-green-800' : r.match_type.includes('Fuzzy') ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                      {Math.round(r.similarity_score * 100)}%
                    </span>
                    <span className="text-on-surface">{r.sentence}</span>
                  </div>
                ))}
                {ragResults.length > 20 && <p className="text-xs text-on-surface-variant text-center pt-2">...and {ragResults.length - 20} more</p>}
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-5xl mx-auto mt-8 flex justify-end gap-4">
          <button onClick={() => navigate('/upload')} className="px-6 py-3 border border-outline-variant text-on-surface-variant font-bold text-sm rounded-full hover:bg-surface-container transition-all cursor-pointer">
            ← Back to Upload
          </button>
          <button onClick={handleProceed} disabled={running} className="px-10 py-3.5 bg-gradient-to-r from-tertiary to-tertiary-container text-white font-bold text-sm rounded-full shadow-lg shadow-tertiary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-lg">magic_button</span>
            {running ? 'Analyzing...' : 'Continue → Go to Editor'}
          </button>
        </div>
      </main>
    </>
  );
}
