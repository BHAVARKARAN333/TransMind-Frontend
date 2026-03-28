import React, { createContext, useContext, useState } from 'react';

/**
 * PipelineContext — Global state shared across Upload, SourceValidator, and TranslationEditor.
 * This is the single source of truth for the translation pipeline.
 */
const PipelineContext = createContext(null);

export function PipelineProvider({ children }) {
  // Phase 1: Extracted blocks from DOCX
  const [blocks, setBlocks] = useState([]);
  // Phase 2: Sentence segments from text processor
  const [segments, setSegments] = useState([]);
  // Phase 3: Language settings
  const [sourceLang, setSourceLang] = useState('en');
  const [sourceLangName, setSourceLangName] = useState('English');
  const [targetLang, setTargetLang] = useState('es');
  const [targetLangName, setTargetLangName] = useState('Spanish');
  const [tone, setTone] = useState('formal');
  // Phase 4+5: RAG + Decision results per segment
  const [ragResults, setRagResults] = useState([]);
  // Phase 6: Final merged translations per segment
  const [translations, setTranslations] = useState([]);
  // Uploaded file name
  const [fileName, setFileName] = useState('');
  
  // Stored base64 file for Docx export
  const [originalFileBase64, setOriginalFileBase64] = useState('');
  const [originalFormat, setOriginalFormat] = useState('docx');

  // Pipeline step tracking: 'idle' | 'extracted' | 'validated' | 'translated'
  const [pipelineStep, setPipelineStep] = useState('idle');

  // Reset the whole pipeline
  const resetPipeline = () => {
    setBlocks([]);
    setSegments([]);
    setRagResults([]);
    setTranslations([]);
    setFileName('');
    setOriginalFileBase64('');
    setOriginalFormat('docx');
    setPipelineStep('idle');
  };

  return (
    <PipelineContext.Provider value={{
      blocks, setBlocks,
      segments, setSegments,
      sourceLang, setSourceLang,
      sourceLangName, setSourceLangName,
      targetLang, setTargetLang,
      targetLangName, setTargetLangName,
      tone, setTone,
      ragResults, setRagResults,
      translations, setTranslations,
      fileName, setFileName,
      originalFileBase64, setOriginalFileBase64,
      originalFormat, setOriginalFormat,
      pipelineStep, setPipelineStep,
      resetPipeline,
    }}>
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  const context = useContext(PipelineContext);
  if (!context) throw new Error('usePipeline must be used within a PipelineProvider');
  return context;
}
