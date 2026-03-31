import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PipelineProvider } from './context/PipelineContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Glossary from './pages/Glossary';
import Analytics from './pages/Analytics';
import SourceValidator from './pages/SourceValidator';
import TranslationEditor from './pages/TranslationEditor';
import SimilarityTest from './pages/SimilarityTest';
import Login from './pages/Login';
import Landing from './pages/Landing';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <PipelineProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected App Routes */}
            <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="upload" element={<Upload />} />
              <Route path="glossary" element={<Glossary />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="source-validator" element={<SourceValidator />} />
              <Route path="editor" element={<TranslationEditor />} />
              <Route path="similarity" element={<SimilarityTest />} />
              <Route path="pipeline" element={<Navigate to="/app/upload" replace />} />
              <Route path="settings" element={
                <div className="ml-[240px] p-10 mt-16 min-h-screen text-slate-500 font-bold uppercase tracking-widest text-xs">Settings coming soon...</div>
              } />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PipelineProvider>
    </AuthProvider>
  );
}

export default App;
