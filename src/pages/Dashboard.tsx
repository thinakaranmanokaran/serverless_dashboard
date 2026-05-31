import React, { useState, useMemo } from 'react';
import { useGitHub } from '../hooks/useGitHub';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  GitBranch, 
  Star, 
  Clock, 
  Lock, 
  Globe, 
  ChevronRight,
  Plus,
  FileJson,
  LayoutGrid,
  List,
  Sparkles,
  Github,
  ExternalLink,
  ArrowRight,
  FilePlus,
  Loader2,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog";
import { ScrollArea } from '../components/ui/scroll-area';

interface DashboardProps {
  onEditFile: (repo: any, path: string | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onEditFile }) => {
  const { repos, isLoading, user, service, error, clearError } = useGitHub();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const bannerError = useMemo(() => {
    if (!error) return null;
    if (error.includes('AUTH_EXPIRED')) return null; // These redirect to login
    return error;
  }, [error]);

  // New Config Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'repo' | 'file' | 'name'>('repo');
  const [selectedRepoForNew, setSelectedRepoForNew] = useState<any>(null);
  const [repoFiles, setRepoFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const [newFileName, setNewFileName] = useState('');

  const filteredRepos = useMemo(() => {
    return repos.filter(repo => 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [repos, searchQuery]);

  const modalFilteredRepos = useMemo(() => {
    return repos.filter(repo => 
      repo.name.toLowerCase().includes(repoSearch.toLowerCase())
    );
  }, [repos, repoSearch]);

  const [recentRepos, setRecentRepos] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem('gh_recent_repos') || '[]');
  });

  const updateRecentRepos = (repo: any) => {
    const recent = JSON.parse(localStorage.getItem('gh_recent_repos') || '[]');
    const filtered = recent.filter((r: any) => r.id !== repo.id);
    const updated = [repo, ...filtered].slice(0, 5);
    localStorage.setItem('gh_recent_repos', JSON.stringify(updated));
    setRecentRepos(updated);
  };

  const handleEditFile = (repo: any, path: string | null) => {
    if (repo) {
      if (modalStep === 'name' && !newFileName.trim()) {
        toast.error('Please enter a file name');
        return;
      }

      const finalPath = path || (newFileName.endsWith('.json') ? newFileName : `${newFileName}.json`);
      updateRecentRepos(repo);
      onEditFile(repo, finalPath);
      setIsModalOpen(false);
    }
  };

  const handleRepoSelect = async (repo: any) => {
    updateRecentRepos(repo);
    setSelectedRepoForNew(repo);
    setModalStep('file');
    setIsLoadingFiles(true);
    try {
      if (service) {
        // We look for JSON files in the root
        const contents = await service.getContents(repo.owner.login, repo.name, '');
        const jsonFiles = Array.isArray(contents) 
          ? contents.filter((f: any) => f.type === 'file' && f.name.endsWith('.json'))
          : [];
        setRepoFiles(jsonFiles);
      }
    } catch (error) {
      console.error('Failed to fetch repo contents:', error);
      setRepoFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const resetModal = () => {
    setModalStep('repo');
    setSelectedRepoForNew(null);
    setRepoFiles([]);
    setRepoSearch('');
    setNewFileName('');
  };

  return (
    <div className="space-y-12 pb-20 relative z-10">
      <AnimatePresence>
        {bannerError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-between gap-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-destructive uppercase tracking-widest">Error Encountered</h4>
                  <p className="text-xs text-destructive/80 font-medium">{bannerError}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className="text-destructive hover:bg-destructive/10 h-8 font-bold"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Section / Hero Area */}
      <section className="relative overflow-hidden p-10 rounded-[32px] bg-background border border-border/50 shadow-xl shadow-primary/5">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-link/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-2 py-0.5 rounded-full bg-link/10 text-link text-[10px] font-bold uppercase tracking-widest border border-link/20">
                Authorized as {user?.login}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight leading-tight">
              Select a repository to get started.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Choose one of your GitHub repositories to manage its live configuration files.
            </p>
          </div>
          <Button 
             size="lg"
             className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-2xl px-8 h-14 font-bold transition-all shrink-0"
             onClick={() => {
               resetModal();
               setIsModalOpen(true);
             }}
          >
            <Plus className="w-5 h-5" />
            New Config
          </Button>
        </div>
      </section>

      {/* Stats Quick Grid Removed for simplicity */}

      {/* Recent Repositories */}
      {recentRepos.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-link" />
            <h3 className="text-xl font-semibold text-foreground tracking-tight">Jump Back In</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentRepos.map((repo: any) => (
              <button
                key={repo.id}
                onClick={() => handleEditFile(repo, null)}
                className="group p-4 rounded-xl bg-secondary/30 hairline hover:bg-secondary/50 transition-all text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-background text-muted-foreground flex items-center justify-center shrink-0 border border-border group-hover:border-link/30 group-hover:text-link transition-all">
                  <Github className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground group-hover:text-link transition-colors">{repo.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{repo.owner.login}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Your Repositories */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h3 className="text-2xl font-semibold text-foreground tracking-tight">Your Repositories</h3>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-muted-foreground hover:bg-secondary"
              onClick={() => setIsHelpOpen(true)}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Filter repositories..." 
                className="pl-10 bg-secondary border-border text-foreground h-10 rounded-md focus:border-muted-foreground/30 transition-all placeholder:text-muted-foreground/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex p-1 bg-secondary rounded-md hairline shrink-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full bg-secondary rounded-2xl" />
            ))}
          </div>
        ) : filteredRepos.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
            {filteredRepos.map((repo: any, i: number) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card 
                  className={`bg-card hairline hover:hairline-strong transition-all cursor-pointer group shadow-sm hover:card-shadow ${viewMode === 'list' ? 'flex flex-row items-center p-4' : 'h-full flex flex-col'}`}
                  onClick={() => handleEditFile(repo, null)}
                >
                  <CardContent className={`p-0 ${viewMode === 'list' ? 'flex-1 flex items-center justify-between' : 'p-6 flex-1 flex flex-col'}`}>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center border border-border group-hover:bg-secondary/80 transition-all">
                          <Github className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-link transition-colors truncate max-w-[200px] text-lg leading-tight">{repo.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
                              {repo.private ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                              {repo.private ? 'Private' : 'Public'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {viewMode === 'grid' && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[40px]">
                          {repo.description || 'No description provided for this repository.'}
                        </p>
                      )}
                    </div>

                    <div className={`${viewMode === 'grid' ? 'mt-auto pt-6 flex items-center justify-between border-t border-border' : 'flex items-center gap-8'}`}>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Star className="w-3.5 h-3.5" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center bg-secondary border-2 border-dashed border-border rounded-[24px] p-10 text-center">
            <div className="w-16 h-16 bg-card rounded-full border border-border flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-2">No matching repositories</h4>
            <p className="text-muted-foreground">Try adjusting your search filters or check your account permissions.</p>
          </div>
        )}
      </div>
      {/* New Configuration Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {modalStep === 'repo' ? 'Select Repository' : modalStep === 'file' ? 'Select Configuration File' : 'Name Your Configuration'}
            </DialogTitle>
            <DialogDescription>
              {modalStep === 'repo' 
                ? 'Choose a repository to manage its configurations.' 
                : modalStep === 'file'
                ? `Select an existing JSON file in ${selectedRepoForNew?.name} or create a new one.`
                : `Enter a name for your new configuration file in ${selectedRepoForNew?.name}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-2 pb-6">
            {modalStep === 'repo' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search your repositories..." 
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    className="pl-10 h-10 bg-secondary/50 border-border"
                  />
                </div>
                
                <ScrollArea className="h-[300px] -mx-2 px-2">
                  <div className="space-y-1">
                    {modalFilteredRepos.map(repo => (
                      <button
                        key={repo.id}
                        onClick={() => handleRepoSelect(repo)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-background hairline flex items-center justify-center text-muted-foreground">
                            <Github className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{repo.name}</p>
                            <p className="text-[10px] text-muted-foreground">{repo.private ? 'Private' : 'Public'}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Can't find your repo?</p>
                  <Button 
                    variant="link" 
                    className="text-xs text-link h-auto p-0 gap-1"
                    onClick={() => window.open('https://github.com/new', '_blank')}
                  >
                    Create on GitHub
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : modalStep === 'file' ? (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setModalStep('repo')}
                  className="mb-2 -ml-2 text-muted-foreground hover:text-foreground h-8"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 mr-2" />
                  Back to Repositories
                </Button>

                {isLoadingFiles ? (
                  <div className="h-48 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-link" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Scanning Repository...</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] -mx-2 px-2">
                    <div className="space-y-2">
                      <button
                        onClick={() => setModalStep('name')}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-link/5 border border-link/20 hover:bg-link/10 transition-all text-left group box-border shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-lg bg-link/10 flex items-center justify-center text-link">
                          <FilePlus className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-link">Create New Configuration</p>
                          <p className="text-xs text-link/70 text-[11px]">Start fresh with a new JSON manifest.</p>
                        </div>
                      </button>

                      <div className="py-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 ml-1">Existing JSON Files</p>
                        {repoFiles.length > 0 ? (
                          <div className="space-y-1">
                            {repoFiles.map(file => (
                              <button
                                key={file.sha}
                                onClick={() => handleEditFile(selectedRepoForNew, file.name)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-all text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-background hairline flex items-center justify-center text-muted-foreground">
                                    <FileJson className="w-4 h-4" />
                                  </div>
                                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-secondary/30 rounded-lg border border-dashed border-border">
                            <p className="text-xs text-muted-foreground italic">No JSON configurations found in root.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setModalStep('file')}
                  className="mb-2 -ml-2 text-muted-foreground hover:text-foreground h-8"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 mr-2" />
                  Back to Files
                </Button>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">File Name</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <FileJson className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-link" />
                        <Input 
                          placeholder="config_v1" 
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          className="pl-10 h-12 bg-secondary/50 border-border text-foreground text-lg font-medium"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleEditFile(selectedRepoForNew, null)}
                        />
                      </div>
                      <span className="text-xl font-bold text-muted-foreground/40">.json</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This file will be created in the root of your repository.
                    </p>
                  </div>

                  <Button 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
                    onClick={() => handleEditFile(selectedRepoForNew, null)}
                  >
                    Start Designing
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Help Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldCheck className="w-5 h-5 text-link" />
              GitHub Permissions
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              To manage your configurations, your GitHub token needs the following permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {[
              { name: 'repo', desc: 'Full control of private and public repositories.' },
              { name: 'contents', desc: 'Read and write access to repository contents.' },
              { name: 'workflow', desc: 'Allow updating GitHub Actions workflow files.' },
              { name: 'metadata', desc: 'Read-only access to repository metadata.' }
            ].map((scope) => (
              <div key={scope.name} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <CheckCircle2 className="w-4 h-4 text-link mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground font-mono leading-none">{scope.name}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{scope.desc}</p>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-xl bg-link/5 border border-link/20 mt-4">
              <p className="text-xs text-link font-medium leading-relaxed">
                Tip: If you encounter "Permission Denied" errors, verify that your token hasn't expired and that all checkboxes above are checked in your <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="underline font-bold">GitHub settings</a>.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button variant="secondary" onClick={() => setIsHelpOpen(false)} className="w-full bg-secondary hover:bg-secondary/80">Got it, thanks!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

