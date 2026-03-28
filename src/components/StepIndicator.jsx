import React from 'react';
import { useLocation } from 'react-router-dom';

const STEPS = [
  { path: '/upload', label: 'Upload', icon: 'upload_file' },
  { path: '/source-validator', label: 'Validate', icon: 'spellcheck' },
  { path: '/editor', label: 'Translate', icon: 'edit_document' },
];

export default function StepIndicator() {
  const { pathname } = useLocation();
  const currentIdx = STEPS.findIndex(s => pathname.startsWith(s.path));
  if (currentIdx === -1) return null;

  return (
    <div className="flex items-center gap-0 bg-surface-container-low rounded-full px-4 py-1.5 border border-outline-variant/20 shadow-sm">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={step.path}>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${active ? 'bg-primary text-white' : done ? 'text-[#005320]' : 'text-on-surface-variant/40'}`}>
              <span className={`material-symbols-outlined text-sm`}
                style={done ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {done ? 'check_circle' : step.icon}
              </span>
              <span className={`text-[11px] font-bold tracking-wide ${active ? '' : done ? '' : ''}`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`material-symbols-outlined text-sm mx-1 ${done ? 'text-[#005320]' : 'text-outline-variant/30'}`}>
                chevron_right
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
