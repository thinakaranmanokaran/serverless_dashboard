import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GitHubService, GitHubRepo } from '../services/github';

interface GitHubContextType {
  token: string | null;
  user: any | null;
  repos: GitHubRepo[];
  isLoading: boolean;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  service: GitHubService | null;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export const GitHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('gh_token'));
  const [user, setUser] = useState<any | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<GitHubService | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setRepos([]);
    setService(null);
    localStorage.removeItem('gh_token');
  }, []);

  const initService = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const ghService = new GitHubService(token, () => {
        logout();
        setError('AUTH_EXPIRED: Your session has expired. Please log in again.');
      });
      const userData = await ghService.getUser();
      const reposData = await ghService.getRepos();
      
      setUser(userData);
      setRepos(reposData);
      setService(ghService);
      setToken(token);
      localStorage.setItem('gh_token', token);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to authenticate with GitHub';
      setError(errorMessage);
      if (errorMessage.includes('AUTH_EXPIRED') || errorMessage.includes('Bad credentials')) {
        logout();
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const savedToken = localStorage.getItem('gh_token');
    if (savedToken && !service && !isLoading) {
      initService(savedToken).catch(() => {
        // Silent fail on auto-init, already handled in initService
      });
    }
  }, [service, isLoading, initService]);

  const login = async (newToken: string) => {
    await initService(newToken);
  };

  return (
    <GitHubContext.Provider
      value={{
        token,
        user,
        repos,
        isLoading,
        error,
        login,
        logout,
        clearError,
        service,
      }}
    >
      {children}
    </GitHubContext.Provider>
  );
};

export const useGitHub = () => {
  const context = useContext(GitHubContext);
  if (context === undefined) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
};
