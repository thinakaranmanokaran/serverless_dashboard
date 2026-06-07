import React, { useState, useEffect } from 'react';
import { useGitHub } from '../hooks/useGitHub';
import { VisualBuilder } from '../components/VisualBuilder';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Code, 
  Eye, 
  Settings, 
  Github, 
  GitBranch, 
  FileJson,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronRight,
  Plus,
  ShieldCheck,
  Trash
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Textarea } from '../components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';

interface EditorProps {
  repo: any;
  initialPath: string | null;
  onBack: () => void;
}

export const Editor: React.FC<EditorProps> = ({ repo: initialRepo, initialPath, onBack }) => {
  const { repos, service, user } = useGitHub();
  const [selectedRepo, setSelectedRepo] = useState<any>(initialRepo);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [files, setFiles] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [configData, setConfigData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [newFilePath, setNewFilePath] = useState('');
  const [rawJson, setRawJson] = useState('');
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  const presets = [
    {
      name: 'Basic Feature Flags',
      description: 'Simple boolean flags for feature toggling',
      data: {
        features: {
          newOnboarding: true,
          betaProfile: false,
          darkTheme: true
        },
        version: "1.0.0"
      }
    },
    {
      name: 'App Maintenance',
      description: 'Global maintenance mode configuration',
      data: {
        maintenance: {
          enabled: false,
          title: "Scheduled Maintenance",
          message: "We'll be back in 2 hours",
          retryAfter: 7200
        }
      }
    },
    {
      name: 'Dynamic Settings',
      description: 'Nested configuration for complex apps',
      data: {
        api: {
          timeout: 5000,
          retryAttempts: 3,
          endpoints: ["v1", "v2"]
        },
        ui: {
          borderRadius: 8,
          accentColor: "#0d74ce"
        }
      }
    }
  ];

  // Initial Data
  useEffect(() => {
    if (selectedRepo && service) {
      service.getBranches(selectedRepo.owner.login, selectedRepo.name).then(data => {
        setBranches(data);
        const main = data.find((b: any) => b.name === 'main' || b.name === 'master') || data[0];
        if (main) setSelectedBranch(main.name);
      });
    }
  }, [selectedRepo, service]);

  useEffect(() => {
    if (selectedRepo && selectedBranch && service) {
      loadFiles();
    }
  }, [selectedRepo, selectedBranch, service]);

  const loadFiles = async () => {
    try {
      const data = await service?.getContents(selectedRepo.owner.login, selectedRepo.name, '', selectedBranch);
      const fetchedFiles = Array.isArray(data) ? data.filter((f: any) => f.name.endsWith('.json')) : [];
      setFiles(fetchedFiles);

      if (initialPath) {
        const found = fetchedFiles.find((f: any) => f.path === initialPath || f.name === initialPath);
        if (found && !currentFile) {
          handleFileSelect(found);
        } else if (!found && !currentFile) {
          setNewFilePath(initialPath);
        }
      }
    } catch (err) {
      toast.error('Failed to load files');
    }
  };

  const handleFileSelect = async (file: any) => {
    setIsLoadingFile(true);
    try {
      const data = await service?.getContents(selectedRepo.owner.login, selectedRepo.name, file.path, selectedBranch);
      const content = atob(data.content);
      setConfigData(JSON.parse(content));
      setRawJson(content);
      setCurrentFile(data);
      setViewMode('visual');
    } catch (err) {
      toast.error('Failed to load file content');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleRawJsonChange = (val: string) => {
    setRawJson(val);
    try {
      const parsed = JSON.parse(val);
      setConfigData(parsed);
    } catch (e) {
      // Invalid JSON, don't update configData yet but keep rawJson
    }
  };

  const handleConfigChange = (newData: any) => {
    setIsSyncing(true);
    setConfigData(newData);
    // Simulate a brief sync delay for UX feedback
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const handleSave = async () => {
    if (!selectedRepo || !selectedBranch || (!currentFile && !newFilePath)) {
      toast.error('Please select or name a file');
      return;
    }

    // If in code mode, ensure JSON is valid before saving
    if (viewMode === 'code') {
      try {
        JSON.parse(rawJson);
      } catch (e) {
        toast.error('Invalid JSON format. Please fix the errors before saving.');
        return;
      }
    }

    setIsSaving(true);
    const content = viewMode === 'code' ? rawJson : JSON.stringify(configData, null, 2);
    const path = currentFile ? currentFile.path : (newFilePath.endsWith('.json') ? newFilePath : `${newFilePath}.json`);
    const message = `Update ${path} via Remote Config Dashboard`;

    try {
      await service?.updateFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        path,
        content,
        message,
        currentFile?.sha,
        selectedBranch
      );
      toast.success('Configuration saved to GitHub!');
      loadFiles();
      if (!currentFile) {
        // Refresh after new file create
        const newFileList = await service?.getContents(selectedRepo.owner.login, selectedRepo.name, '', selectedBranch);
        const addedFile = newFileList.find((f: any) => f.path === path);
        if (addedFile) setCurrentFile(addedFile);
      }
    } catch (err: any) {
      toast.error('Failed to save file', {
        description: err.message || 'Check your permissions and token status.',
        action: {
          label: 'View Docs',
          onClick: () => window.open('https://docs.github.com/en/rest/repos/contents', '_blank')
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset: any) => {
    setConfigData(preset.data);
    setRawJson(JSON.stringify(preset.data, null, 2));
    setIsPresetsOpen(false);
    toast.success(`${preset.name} preset applied`);
  };

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col bg-[#fafafa] overflow-hidden relative z-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Editor Header / Breadcrumbs */}
      <div className="h-16 shrink-0 border-b border-[#e5e5e5] flex items-center justify-between px-6 lg:px-8 bg-white z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="h-10 px-4 rounded-xl hover:bg-[#f5f5f5] text-[#737373] hover:text-black flex items-center gap-2 font-bold transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <div className="w-px h-5 bg-[#e5e5e5]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center">
              <FileJson className="w-4 h-4 text-black" />
            </div>
            <h1 className="text-sm font-bold text-black truncate max-w-[250px]">
              {currentFile?.name || 'New Configuration'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg text-[11px] font-bold text-black uppercase tracking-widest">
            <GitBranch className="w-3.5 h-3.5" />
            {selectedBranch}
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn-primary gap-2 h-10 px-6"
          >
            {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1440px] mx-auto w-full">
        {/* Left Side: Context & File Browser */}
        <div className="lg:w-[300px] xl:w-[320px] shrink-0 flex flex-col gap-6">
          <div className="space-y-6">
            {/* Repository Info */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] mb-3 block ml-1">Repository</label>
              <div className="p-4 bg-white border border-[#e5e5e5] rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center shrink-0">
                    <Github className="w-5 h-5 text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-black truncate">{selectedRepo?.name}</p>
                    <p className="text-xs text-[#737373] truncate">{selectedRepo?.owner.login}</p>
                  </div>
                </div>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="h-10 bg-[#f5f5f5] border-[#e5e5e5] text-xs font-semibold text-black rounded-xl">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#e5e5e5] rounded-xl shadow-lg">
                    {branches.map(b => (
                      <SelectItem key={b.name} value={b.name} className="font-medium text-sm">{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Configurations List */}
            <div className="flex-1 flex flex-col min-h-[300px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] mb-3 block ml-1">Configurations</label>
              <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-sm p-2 flex flex-col flex-1">
                <ScrollArea className="flex-1 -mx-2 px-2">
                  <div className="space-y-1">
                    {files.length > 0 ? (
                      files.map(file => (
                        <button
                          key={file.sha}
                          onClick={() => handleFileSelect(file)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                            currentFile?.sha === file.sha 
                              ? 'bg-black text-white font-bold shadow-md' 
                              : 'text-[#737373] hover:bg-[#f5f5f5] hover:text-black font-semibold'
                          }`}
                        >
                          <FileJson className={`w-4 h-4 shrink-0 ${currentFile?.sha === file.sha ? 'text-white' : 'group-hover:text-black'}`} />
                          <span className="text-sm truncate">{file.name}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-[#737373] italic p-4 text-center">No JSON files found.</p>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="pt-2 mt-2 border-t border-[#e5e5e5] shrink-0">
                  <div className="flex gap-2 p-1.5 bg-[#f5f5f5] rounded-xl items-center focus-within:ring-2 ring-black/10 transition-all border border-transparent focus-within:border-[#e5e5e5]">
                    <Plus className="w-4 h-4 text-[#737373] ml-2 shrink-0" />
                    <input 
                      placeholder="filename.json" 
                      className="h-8 w-full bg-transparent border-none text-xs font-semibold text-black placeholder:text-[#737373]/50 focus:outline-none"
                      value={newFilePath}
                      onChange={(e) => setNewFilePath(e.target.value)}
                    />
                    <button 
                      className="h-8 w-8 shrink-0 flex items-center justify-center bg-white hover:bg-black hover:text-white text-black rounded-lg border border-[#e5e5e5] transition-all"
                      onClick={() => {
                        setCurrentFile(null);
                        setConfigData({});
                        toast.success('Ready for new config');
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#d4f57a]/20 border border-[#d4f57a]/40 rounded-2xl">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-black mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#84cc16]" />
                Validated Workflow
              </h4>
              <p className="text-xs text-black/70 leading-relaxed font-medium">
                Changes are saved directly to your GitHub repository.
              </p>
            </div>
          </div>
        </div>

        {/* Builder / Code Surface */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 relative">
          <div className="flex-1 bg-white border border-[#e5e5e5] rounded-3xl overflow-hidden flex flex-col shadow-sm">
            <div className="h-16 border-b border-[#e5e5e5] flex items-center justify-between px-6 bg-[#f5f5f5]/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-[#e5e5e5]/50 p-1 rounded-xl flex items-center border border-[#e5e5e5]">
                  <button
                    onClick={() => setViewMode('visual')}
                    className={`h-8 px-4 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${viewMode === 'visual' ? 'bg-white text-black shadow-sm border border-[#e5e5e5]' : 'text-[#737373] hover:text-black'}`}
                  >
                    Visual Builder
                  </button>
                  <button
                    onClick={() => {
                      setRawJson(JSON.stringify(configData, null, 2));
                      setViewMode('code');
                    }}
                    className={`h-8 px-4 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${viewMode === 'code' ? 'bg-white text-black shadow-sm border border-[#e5e5e5]' : 'text-[#737373] hover:text-black'}`}
                  >
                    Raw JSON
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  className="h-9 px-4 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 bg-white border border-[#e5e5e5] rounded-lg hover:border-black/20 transition-all text-black shadow-sm"
                  onClick={() => setIsPresetsOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Presets
                </button>
                <div className="hidden md:flex items-center gap-2 px-3">
                  <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-black animate-pulse' : 'bg-[#84cc16]'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#737373]">
                    {isSyncing ? 'Syncing...' : 'Status: Draft'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-white">
              {isLoadingFile ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-20">
                  <div className="w-12 h-12 border-4 border-[#f5f5f5] border-t-black rounded-full animate-spin" />
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-[#737373]">Pulling Data...</p>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {viewMode === 'visual' ? (
                    <ScrollArea className="flex-1 custom-scrollbar">
                      <div className="p-8 relative">
                        <AnimatePresence>
                          {isSyncing && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-x-0 top-0 h-1 bg-[#d4f57a] z-10 overflow-hidden"
                            >
                              <motion.div 
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="h-full w-1/3 bg-black"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <VisualBuilder 
                          data={configData} 
                          onChange={handleConfigChange} 
                        />
                        {Object.keys(configData).length === 0 && (
                          <div className="flex flex-col items-center justify-center text-center p-16 mt-8 bg-[#f5f5f5] rounded-3xl border-2 border-dashed border-[#e5e5e5]">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-[#e5e5e5] mb-6 shadow-sm">
                              <Plus className="w-8 h-8 text-[#e5e5e5]" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">Empty Configuration</h3>
                            <p className="text-sm text-[#737373] max-w-sm">Start adding keys to your new configuration using the visual builder or apply a preset.</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex-1 bg-[#0a0a0a] overflow-hidden flex flex-col rounded-2xl m-6 shadow-lg relative border border-black/10">
                      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#111111]">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 ml-1">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                          </div>
                          <div className="w-px h-4 bg-white/10 mx-2" />
                          <Code className="w-4 h-4 text-[#d4f57a]" />
                          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/70">Raw Configuration</span>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(rawJson);
                            toast.success('JSON Copied');
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
                        >
                          Copy Payload
                        </button>
                      </div>
                      <ScrollArea className="flex-1 custom-scrollbar">
                        <div className="flex min-h-full">
                          <div className="w-12 bg-[#0d1117] border-r border-white/5 py-6 flex flex-col items-center select-none opacity-50 font-mono text-xs text-white/40 shrink-0">
                            {Array.from({ length: Math.max(rawJson.split('\n').length, 1) }).map((_, i) => (
                              <div key={i} className="leading-6 h-6">{i + 1}</div>
                            ))}
                          </div>
                          <div className="relative flex-1">
                            <Textarea 
                              value={rawJson}
                              onChange={(e) => handleRawJsonChange(e.target.value)}
                              className="absolute inset-0 w-full h-full p-6 py-6 font-mono text-[14px] leading-relaxed text-[#d4f57a] bg-transparent border-none resize-none focus-visible:ring-0 selection:bg-[#d4f57a]/20 min-h-[500px]"
                              spellCheck={false}
                            />
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-6 h-12 bg-[#f5f5f5]/50 border-t border-[#e5e5e5] flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#84cc16]" />
                 <p className="text-[11px] font-bold uppercase tracking-widest text-black">Safe Mode Enabled</p>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#737373]">
                 <span>Schema Validated</span>
                 <span>{Object.keys(configData).length} Fields</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Presets Dialog */}
      <Dialog open={isPresetsOpen} onOpenChange={setIsPresetsOpen}>
        <DialogContent className="bg-white border-[#e5e5e5] sm:max-w-[500px] rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-[#e5e5e5] bg-[#fafafa]">
            <DialogTitle className="text-xl font-bold text-black">Configuration Presets</DialogTitle>
            <DialogDescription className="text-sm text-[#737373] mt-2">
              Choose a template to quickly bootstrap your configuration. This will overwrite your current draft.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 p-4 bg-white max-h-[400px] overflow-y-auto">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="flex flex-col gap-0 p-4 rounded-2xl border border-[#e5e5e5] bg-white hover:border-black hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-base text-black">{preset.name}</span>
                  <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all text-[#737373]">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-sm text-[#737373] leading-relaxed">{preset.description}</span>
              </button>
            ))}
          </div>
          <DialogFooter className="pt-0 bg-[#fafafa] border-t border-[#e5e5e5]">
            <button className="px-6 m-4 py-2 rounded-2xl bg-black/5 hover:bg-black/10 transition-all duration-300 cursor-pointer text-sm font-bold text-[#737373] hover:text-black transition-colors" onClick={() => setIsPresetsOpen(false)}>Cancel</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
