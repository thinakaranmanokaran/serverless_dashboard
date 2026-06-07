import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { GitHubProvider, useGitHub } from './hooks/useGitHub';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from 'sonner';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { Home } from './pages/Home';
import { Docs } from './pages/Docs';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Layout } from './layouts/Layout';
import { useState } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useGitHub();
  if (isLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      <p className="mt-5 caption text-[#737373]">Connecting…</p>
    </div>
  );
  if (!token) return <Navigate to="/register" replace />;
  return <>{children}</>;
}

function RepoRoute({ editorState, setEditorState }: any) {
  const location = useLocation();
  const repo = location.state?.repo;

  if (!repo) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Editor 
      repo={repo} 
      initialPath={null} 
      onBack={() => setEditorState(null)} 
    />
  );
}

function AppContent() {
  const [editorState, setEditorState] = useState<{ repo: any; path: string | null } | null>(null);
  const noop = () => {};

  return (
    <Routes>
      {/* Public routes with nav layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/privacy" element={<Privacy onNavigate={noop} />} />
        <Route path="/terms" element={<Terms onNavigate={noop} />} />
      </Route>

      {/* Auth — no layout chrome */}
      <Route path="/register" element={<Login />} />

      {/* Protected routes */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={
          <Dashboard onEditFile={(repo, path) => setEditorState({ repo, path })} />
        } />
        <Route path="/:username/:repo" element={
          <RepoRoute editorState={editorState} setEditorState={setEditorState} />
        } />
        <Route path="/editor" element={
          editorState
            ? <Editor repo={editorState.repo} initialPath={editorState.path} onBack={() => setEditorState(null)} />
            : <Navigate to="/dashboard" replace />
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GitHubProvider>
        <AppContent />
        <Toaster position="top-center" richColors />
      </GitHubProvider>
    </ThemeProvider>
  );
}
