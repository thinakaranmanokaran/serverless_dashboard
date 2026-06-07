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
      setFiles(Array.isArray(data) ? data.filter((f: any) => f.name.endsWith('.json')) : []);
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
    <div className="h-full flex flex-col bg-background overflow-hidden relative z-10">
      {/* Editor Header / Breadcrumbs */}
      <div className="h-16 shrink-0 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="h-10 hover:bg-secondary text-muted-foreground flex items-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="w-px h-4 bg-border" />
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-foreground flex items-center gap-2 truncate max-w-[200px]">
              <FileJson className="w-4 h-4 text-link" />
              {currentFile?.name || 'New Configuration'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md hairline text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            <GitBranch className="w-3 h-3" />
            {selectedBranch}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium px-6 h-10 rounded-md transition-all active:scale-95"
          >
            {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-8 p-8 max-w-[1400px] mx-auto w-full">
        {/* Left Side: Context & File Browser */}
        <div className="lg:w-[320px] shrink-0 flex flex-col gap-6">
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60 mb-2 block">Identity</label>
              <div className="p-4 bg-secondary/30 hairline rounded-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded bg-card hairline flex items-center justify-center">
                    <Github className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{selectedRepo?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{selectedRepo?.owner.login}</p>
                  </div>
                </div>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="h-9 bg-card hairline text-xs font-medium">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {branches.map(b => (
                      <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60 mb-2 block">Configurations</label>
              <div className="space-y-1">
                {files.length > 0 ? (
                  files.map(file => (
                    <button
                      key={file.sha}
                      onClick={() => handleFileSelect(file)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-all text-left ${
                        currentFile?.sha === file.sha 
                          ? 'bg-secondary text-foreground font-semibold' 
                          : 'text-muted-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <FileJson className={`w-4 h-4 shrink-0 ${currentFile?.sha === file.sha ? 'text-link' : ''}`} />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic p-2">No JSON files found.</p>
                )}
                
                <div className="pt-2">
                  <div className="flex gap-2 p-1 bg-secondary/30 hairline rounded-md items-center">
                    <Plus className="w-4 h-4 text-muted-foreground/40 ml-2" />
                    <Input 
                      placeholder="Add filename.json" 
                      className="h-10 bg-transparent border-none text-xs focus-visible:ring-0  px-4 rounded-md"
                      value={newFilePath}
                      onChange={(e) => setNewFilePath(e.target.value)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 hover:bg-card rounded"
                      onClick={() => {
                        setCurrentFile(null);
                        setConfigData({});
                        toast.success('Ready for new config');
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/40 rounded-md">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-foreground mb-2 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                Validated Workflow
              </h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                Your changes are validated against the current schema before deployment.
              </p>
            </div>
          </div>
        </div>

        {/* Builder / Code Surface */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <Card className="flex-1 bg-card hairline rounded-lg overflow-hidden flex flex-col card-shadow">
            <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-secondary/30 shrink-0">
              <div className="flex items-center gap-4">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="bg-muted p-0.5 rounded-md h-8">
                  <TabsList className="bg-transparent border-none h-full">
                    <TabsTrigger value="visual" className="h-7 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 transition-all" onClick={() => setRawJson(JSON.stringify(configData, null, 2))}>Visual</TabsTrigger>
                    <TabsTrigger value="code" className="h-7 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 transition-all" onClick={() => setRawJson(JSON.stringify(configData, null, 2))}>Raw JSON</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-[10px] uppercase font-bold tracking-widest gap-2 bg-secondary/50 border-border"
                  onClick={() => setIsPresetsOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Presets
                </Button>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-link animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {isSyncing ? 'Syncing...' : 'Status: Draft'}
                  </span>
                </div>
                {currentFile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[11px] font-semibold text-link hover:bg-link/5 hover:text-link px-3 gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {isLoadingFile ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20">
                  <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Pulling Data...</p>
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
                              className="absolute inset-x-0 top-0 h-1 bg-link/30 z-10 overflow-hidden"
                            >
                              <motion.div 
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="h-full w-1/3 bg-link"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <VisualBuilder 
                          data={configData} 
                          onChange={handleConfigChange} 
                        />
                        {Object.keys(configData).length === 0 && (
                          <div className="flex flex-col items-center justify-center text-center p-12 mt-12 bg-muted/20 rounded-md hairline border-dashed">
                            <Plus className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Empty Manifest</h3>
                            <p className="text-sm text-muted-foreground">Start adding keys to your new configuration using the builder.</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex-1 bg-[#0a0a0a] overflow-hidden flex flex-col">
                      <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-background/50">
                        <div className="flex items-center gap-2">
                          <Code className="w-3.5 h-3.5 text-link" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">JSON Editor</span>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(rawJson);
                            toast.success('JSON Copied');
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#999999] hover:text-white transition-colors"
                        >
                          Copy Payload
                        </button>
                      </div>
                      <ScrollArea className="flex-1 custom-scrollbar">
                        <div className="relative min-h-full">
                          <Textarea 
                            value={rawJson}
                            onChange={(e) => handleRawJsonChange(e.target.value)}
                            className="absolute inset-0 w-full h-full p-8 font-mono text-sm leading-relaxed text-link bg-transparent border-none resize-none focus-visible:ring-0 selection:bg-link/20 min-h-[500px]"
                            spellCheck={false}
                          />
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-6 h-12 bg-secondary/30 border-t border-border flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                 <p className="text-[11px] font-semibold text-muted-foreground">Safe Mode Enabled</p>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                 <span>Schema V2.4</span>
                 <span>{Object.keys(configData).length} Fields</span>
               </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Presets Dialog */}
      <Dialog open={isPresetsOpen} onOpenChange={setIsPresetsOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configuration Presets</DialogTitle>
            <DialogDescription>
              Choose a template to quickly bootstrap your configuration. This will overwrite your current draft.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="flex flex-col gap-1 p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground group-hover:text-link">{preset.name}</span>
                  <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </div>
                <span className="text-xs text-muted-foreground">{preset.description}</span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPresetsOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

