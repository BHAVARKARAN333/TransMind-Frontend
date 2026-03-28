import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PipelineProvider } from './context/PipelineContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Glossary from './pages/Glossary';
import Analytics from './pages/Analytics';
import SourceValidator from './pages/SourceValidator';
import TranslationEditor from './pages/TranslationEditor';
import SimilarityTest from './pages/SimilarityTest';

function App() {
  return (
    <PipelineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="glossary" element={<Glossary />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="source-validator" element={<SourceValidator />} />
            <Route path="editor" element={<TranslationEditor />} />
            <Route path="similarity" element={<SimilarityTest />} />
            {/* /pipeline redirects to /upload — no duplicate UI */}
            <Route path="pipeline" element={<Navigate to="/upload" replace />} />
            <Route path="settings" element={
              <div className="ml-[240px] p-10 mt-16 min-h-screen text-on-surface-variant">Settings page placeholder...</div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PipelineProvider>
  );
}

export default App;
