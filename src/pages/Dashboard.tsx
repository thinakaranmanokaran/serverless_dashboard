import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="space-y-12 pb-20 relative z-10 max-w-[1280px] mx-auto">
      <AnimatePresence>
        {bannerError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 mt-6 p-4 rounded-2xl bg-[#fef2f2] border border-[#fecaca] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fee2e2] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#dc2626] uppercase tracking-widest" style={{ fontWeight: 540 }}>Error Encountered</h4>
                  <p className="text-xs text-[#dc2626] font-medium" style={{ fontWeight: 320 }}>{bannerError}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="text-[#dc2626] hover:text-[#b91c1c] transition-colors h-8 font-bold text-sm" style={{ fontWeight: 540 }}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Section / Hero Area */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          <div>
            <p className="eyebrow text-[#737373] mb-4">Dashboard</p>
            <h1 className="display-lg text-black mb-6 max-w-2xl">
              Select a repository to get started.
            </h1>
            <p className="body-lg text-[#3d3d3d] mb-4" style={{ fontWeight: 330 }}>
              Choose one of your GitHub repositories to manage its live configuration files.
            </p>
            <p className="body-sm text-[#737373] mb-8" style={{ fontWeight: 320 }}>
              Authorized as <strong style={{ fontWeight: 540 }}>{user?.login}</strong>
            </p>
          </div>
          <button
            onClick={() => {
              resetModal();
              setIsModalOpen(true);
            }}
            className="btn-primary gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Config
          </button>
        </div>
      </section>

      {/* Stats Quick Grid Removed for simplicity */}

      {/* Recent Repositories */}
      {recentRepos.length > 0 && (
        <section className="color-block color-block-lime section-gap max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-5 h-5 text-black" />
            <h2 className="headline text-black" style={{ fontSize: 22, fontWeight: 540 }}>Jump Back In</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentRepos.map((repo: any) => (
              <button
                key={repo.id}
                onClick={() => handleEditFile(repo, null)}
                className="group p-4 rounded-2xl bg-white/70 hover:bg-white/80 transition-all text-left flex items-center gap-3 border border-black/10"
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-black/10 group-hover:bg-black group-hover:text-white transition-all">
                  <Github className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="body-sm font-semibold truncate text-black group-hover:text-black transition-colors" style={{ fontWeight: 540 }}>{repo.name}</p>
                  <p className="text-[10px] text-black/50 uppercase tracking-widest" style={{ fontWeight: 320 }}>{repo.owner.login}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Your Repositories */}
      <div className="space-y-8 max-w-[1280px] mx-auto">
        <div className="px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-black rounded-full" />
            <h2 className="display-lg text-black" style={{ fontSize: 28, fontWeight: 540 }}>Your Repositories</h2>
            {/* Show the count */}
            <div className="body-sm text-[#737373] px-2" style={{ fontWeight: 320 }}>{repos.length}</div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-[#737373] hover:bg-[#f5f5f5] h-10 w-10"
              onClick={() => setIsHelpOpen(true)}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
              <Input
                placeholder="Filter repositories..."
                className="pl-10 bg-[#f5f5f5] border border-[#e5e5e5] text-black h-10 rounded-lg focus:border-black/20 transition-all placeholder:text-[#737373]/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full bg-[#f5f5f5] rounded-2xl" />
            ))}
          </div>
        ) : filteredRepos.length > 0 ? (
          <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRepos.map((repo: any, i: number) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <motion.button
                  whileHover={{ y: -3 }}
                  onClick={() => handleEditFile(repo, null)}
                  className="w-full p-6 rounded-3xl border border-[#e5e5e5] bg-white group hover:border-black/20 transition-all text-left flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-[#f5f5f5] rounded-lg flex items-center justify-center border border-[#e5e5e5] group-hover:bg-black group-hover:text-white transition-all">
                        <Github className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="headline text-black truncate" style={{ fontSize: 17, fontWeight: 540 }}>{repo.name}</p>
                        <span className="text-[10px] text-black/50 uppercase tracking-widest" style={{ fontWeight: 320 }}>
                          {repo.private ? 'Private' : 'Public'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#e5e5e5] group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </div>

                  <p className="body-sm text-[#737373] line-clamp-2 leading-relaxed min-h-[40px] mb-4 flex-1" style={{ fontWeight: 320 }}>
                    {repo.description || 'No description provided for this repository.'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#737373]" style={{ fontWeight: 320 }}>
                        <Star className="w-3.5 h-3.5" />
                        {repo.stargazers_count}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#737373]" style={{ fontWeight: 320 }}>
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(repo.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="px-6 h-64 flex flex-col items-center justify-center bg-[#f5f5f5] border-2 border-dashed border-[#e5e5e5] rounded-[24px] p-10 text-center">
            <div className="w-16 h-16 bg-white rounded-full border border-[#e5e5e5] flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-[#e5e5e5]" />
            </div>
            <h4 className="headline text-black mb-2" style={{ fontSize: 20, fontWeight: 540 }}>No matching repositories</h4>
            <p className="body-sm text-[#737373]" style={{ fontWeight: 320 }}>Try adjusting your search filters or check your account permissions.</p>
          </div>
        )}
      </div>
      {/* New Configuration Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border border-[#e5e5e5] rounded-3xl">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="headline text-black" style={{ fontSize: 22, fontWeight: 540 }}>
              {modalStep === 'repo' ? 'Select Repository' : modalStep === 'file' ? 'Select Configuration File' : 'Name Your Configuration'}
            </DialogTitle>
            <DialogDescription className="body-sm text-[#737373] mt-2" style={{ fontWeight: 320 }}>
              {modalStep === 'repo'
                ? 'Choose a repository to manage its configurations.'
                : modalStep === 'file'
                  ? `Select an existing JSON file in ${selectedRepoForNew?.name} or create a new one.`
                  : `Enter a name for your new configuration file in ${selectedRepoForNew?.name}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-2 pb-6 max-h-[500px] overflow-y-auto">
            {modalStep === 'repo' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                  <Input
                    placeholder="Search your repositories..."
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    className="pl-10 h-10 bg-[#f5f5f5] border border-[#e5e5e5] text-black placeholder:text-[#737373]/50 rounded-lg"
                  />
                </div>

                <ScrollArea className="h-[300px] -mx-2 px-2">
                  <div className="space-y-1">
                    {modalFilteredRepos.map(repo => (
                      <button
                        key={repo.id}
                        onClick={() => handleRepoSelect(repo)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#f5f5f5] transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5]">
                            <Github className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="body-sm font-semibold text-black" style={{ fontWeight: 540 }}>{repo.name}</p>
                            <p className="text-[10px] text-[#737373] uppercase tracking-widest" style={{ fontWeight: 320 }}>{repo.private ? 'Private' : 'Public'}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#e5e5e5] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-between">
                  <p className="text-xs text-[#737373]" style={{ fontWeight: 320 }}>Can't find your repo?</p>
                  <button
                    className="text-xs text-black underline font-semibold gap-1 inline-flex items-center"
                    onClick={() => window.open('https://github.com/new', '_blank')}
                  >
                    Create on GitHub
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : modalStep === 'file' ? (
              <div className="space-y-4">
                <button
                  onClick={() => setModalStep('repo')}
                  className="inline-flex items-center gap-2 text-[#737373] hover:text-black transition-colors body-sm" style={{ fontWeight: 320 }}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to Repositories
                </button>

                {isLoadingFiles ? (
                  <div className="h-48 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                    <p className="text-xs font-bold text-[#737373] uppercase tracking-widest" style={{ fontWeight: 540 }}>Scanning Repository...</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] -mx-2 px-2">
                    <div className="space-y-2">
                      <button
                        onClick={() => setModalStep('name')}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#d4f57a]/10 border border-[#d4f57a]/30 hover:bg-[#d4f57a]/20 transition-all text-left group shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#d4f57a]/20 flex items-center justify-center text-black">
                          <FilePlus className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="body-sm font-semibold text-black" style={{ fontWeight: 540 }}>Create New Configuration</p>
                          <p className="text-xs text-black/60 mt-0.5" style={{ fontWeight: 320 }}>Start fresh with a new JSON manifest.</p>
                        </div>
                      </button>

                      <div className="py-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#737373] mb-2 ml-1" style={{ fontWeight: 540 }}>Existing JSON Files</p>
                        {repoFiles.length > 0 ? (
                          <div className="space-y-1">
                            {repoFiles.map(file => (
                              <button
                                key={file.sha}
                                onClick={() => handleEditFile(selectedRepoForNew, file.name)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#f5f5f5] transition-all text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5]">
                                    <FileJson className="w-4 h-4" />
                                  </div>
                                  <p className="body-sm font-semibold text-black" style={{ fontWeight: 540 }}>{file.name}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#e5e5e5] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center bg-[#f5f5f5] rounded-lg border border-dashed border-[#e5e5e5]">
                            <p className="text-xs text-[#737373] italic" style={{ fontWeight: 320 }}>No JSON configurations found in root.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={() => setModalStep('file')}
                  className="inline-flex items-center gap-2 text-[#737373] hover:text-black transition-colors body-sm" style={{ fontWeight: 320 }}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to Files
                </button>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] ml-1" style={{ fontWeight: 540 }}>File Name</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <FileJson className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                        <Input
                          placeholder="config_v1"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          className="pl-10 h-12 bg-[#f5f5f5] border border-[#e5e5e5] text-black rounded-lg text-lg font-semibold"
                          style={{ fontWeight: 540 }}
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleEditFile(selectedRepoForNew, null)}
                        />
                      </div>
                      <span className="text-lg font-bold text-[#737373]" style={{ fontWeight: 540 }}>.json</span>
                    </div>
                    <p className="text-xs text-[#737373] mt-2" style={{ fontWeight: 320 }}>
                      This file will be created in the root of your repository.
                    </p>
                  </div>

                  <button
                    onClick={() => handleEditFile(selectedRepoForNew, null)}
                    className="btn-primary w-full"
                  >
                    Start Designing
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
            }
          </div>

          <div className="p-4 bg-[#f5f5f5] border-t border-[#e5e5e5] flex justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-[#737373] hover:text-black transition-colors body-sm px-4 py-2" style={{ fontWeight: 320 }}
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Help Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-[420px] md:max-w-[620px] bg-white border border-[#e5e5e5] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="headline text-black flex items-center gap-2" style={{ fontSize: 22, fontWeight: 540 }}>
              <ShieldCheck className="w-5 h-5 text-black" />
              GitHub Permissions
            </DialogTitle>
            <DialogDescription className="body-sm text-[#737373] mt-2" style={{ fontWeight: 320 }}>
              To manage your configurations, your GitHub token needs the following permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="gap-3 py-4 grid grid-cols-2">
            {[
              { name: 'repo', desc: 'Full control of private and public repositories.' },
              { name: 'contents', desc: 'Read and write access to repository contents.' },
              { name: 'workflow', desc: 'Allow updating GitHub Actions workflow files.' },
              { name: 'metadata', desc: 'Read-only access to repository metadata.' }
            ].map((scope) => (
              <div key={scope.name} className="flex items-start gap-3 p-4 rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5]">
                <CheckCircle2 className="w-4 h-4 text-black mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-mono font-bold text-black uppercase tracking-widest" style={{ fontWeight: 540 }}>{scope.name}</p>
                  <p className="text-xs text-[#737373] mt-1.5 leading-relaxed leading-sm" style={{ fontWeight: 320 }}>{scope.desc}</p>
                </div>
              </div>
            ))}

          </div>
          <div className="p-4 rounded-2xl bg-[#d4f57a]/10 border border-[#d4f57a]/30">
            <p className="text-xs text-black font-semibold leading-relaxed" style={{ fontWeight: 540 }}>
              💡 Tip: If you encounter "Permission Denied" errors, verify that your token hasn't expired and that all checkboxes above are checked in your <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="underline font-bold">GitHub settings</a>.
            </p>
          </div>

          <div className="border-t border-[#e5e5e5] pt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="btn-secondary border border-[#e5e5e5]"
            >
              Got it, thanks!
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

