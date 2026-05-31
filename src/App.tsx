import { useState, useEffect } from 'react';
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

function AppContent() {
  const { token, user, isLoading } = useGitHub();
  const [currentPage, setCurrentPage] = useState<'home' | 'docs' | 'dashboard' | 'editor' | 'privacy' | 'terms'>('home');
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  if (isLoading && !token) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        </div>
        <p className="mt-8 text-muted-foreground animate-pulse font-mono tracking-[0.3em] text-[10px] uppercase font-bold">Synchronizing...</p>
      </div>
    );
  }

  // Public pages (accessible without token)
  const isPublicPage = ['home', 'docs', 'privacy', 'terms'].includes(currentPage);
  
  if (isPublicPage) {
    return (
      <Layout onNavigate={(page) => setCurrentPage(page as any)} activePage={currentPage}>
        {currentPage === 'home' && <Home onStart={() => setCurrentPage('dashboard')} onNavigate={(page) => setCurrentPage(page as any)} />}
        {currentPage === 'docs' && <Docs onNavigate={(page) => setCurrentPage(page as any)} />}
        {currentPage === 'privacy' && <Privacy onNavigate={(page) => setCurrentPage(page as any)} />}
        {currentPage === 'terms' && <Terms onNavigate={(page) => setCurrentPage(page as any)} />}
      </Layout>
    );
  }

  // Protected pages
  if (!token) {
    return <Login onBack={() => setCurrentPage('home')} />;
  }

  return (
    <Layout 
      onNavigate={(page) => setCurrentPage(page as any)} 
      activePage={currentPage}
    >
      {currentPage === 'home' && <Home onStart={() => setCurrentPage('dashboard')} onNavigate={(page) => setCurrentPage(page as any)} />}
      {currentPage === 'docs' && <Docs onNavigate={(page) => setCurrentPage(page as any)} />}
      {currentPage === 'dashboard' && (
        <Dashboard 
          onEditFile={(repo, path) => {
            setSelectedRepo(repo);
            setSelectedPath(path);
            setCurrentPage('editor');
          }} 
        />
      )}
      {currentPage === 'editor' && (
        <Editor 
          repo={selectedRepo} 
          initialPath={selectedPath}
          onBack={() => {
            setCurrentPage('dashboard');
            setSelectedRepo(null);
            setSelectedPath(null);
          }} 
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GitHubProvider>
        <AppContent />
        <Toaster 
          position="top-center"
          theme="dark"
          richColors
        />
      </GitHubProvider>
    </ThemeProvider>
  );
}
