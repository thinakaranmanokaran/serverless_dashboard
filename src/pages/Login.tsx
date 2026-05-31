import React, { useState, useEffect } from 'react';
import { useGitHub } from '../hooks/useGitHub';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Key, Shield, CheckCircle2, ChevronRight, Info, AlertCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { toast } from 'sonner';

interface LoginProps {
  onBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack }) => {
  const [tokenInput, setTokenInput] = useState('');
  const { login, isLoading, error, clearError } = useGitHub();

  useEffect(() => {
    if (error) {
       // Auto-clear error after some time or on new input
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      toast.error('Please enter a GitHub Personal Access Token');
      return;
    }

    try {
      await login(tokenInput.trim());
      toast.success('Successfully authenticated!');
    } catch (err: any) {
      // Error is handled globally in useGitHub
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background overflow-hidden relative noise-bg">
      {/* Immersive Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-link/10 blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[160px]"></div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl px-6 z-10"
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-between gap-4 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-xs font-medium text-destructive leading-tight">{error}</p>
              </div>
              <button 
                onClick={clearError}
                className="w-6 h-6 rounded-md hover:bg-destructive/10 flex items-center justify-center text-destructive/60 transition-colors"
                aria-label="Clear error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center mb-8 text-center">
          {onBack && (
            <Button 
              variant="ghost" 
              className="absolute top-8 left-8 text-muted-foreground hover:text-foreground gap-2"
              onClick={onBack}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </Button>
          )}
          <div className="w-20 h-20 bg-card/50 flex items-center justify-center rounded-3xl mb-6 transform hover:rotate-6 transition-transform border border-border shadow-2xl relative overflow-hidden group p-2">
            <div className="absolute inset-0 bg-link/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src="/logo.png" alt="RemoteConfig.io Logo" className="w-full h-full object-contain relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">RemoteConfig<span className="text-link">.io</span></h1>
          <p className="text-muted-foreground text-sm leading-relaxed">Production configurations with zero infrastructure.</p>
        </div>

        <Card className="bg-card/50 backdrop-blur-3xl border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-link/30 to-transparent" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left Side: Authorization */}
            <div className="p-6 md:p-8 space-y-6 flex flex-col justify-center">
              <div className="space-y-1 text-center md:text-left flex flex-col items-center md:items-start">
                <div className="w-9 h-9 rounded-xl bg-link/10 flex items-center justify-center mb-2">
                  <Key className="w-4 h-4 text-link" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Authorization</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Enter your GitHub Personal Access Token.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Token</label>
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-link h-10 rounded-xl transition-all text-sm"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 rounded-xl transition-all active:scale-95 text-xs"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Enter Dashboard
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </Button>
              </form>
              <p className="text-center text-[11px] text-muted-foreground">
                Don't have a token?{' '}
                <button
                  type="button"
                  onClick={onBack}
                  className="text-link font-semibold hover:underline"
                >
                  Follow the setup guide →
                </button>
              </p>
            </div>

            {/* Right Side: Security & Permissions */}
            <div className="p-6 md:p-8 bg-muted/20 space-y-6 flex flex-col justify-center">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-link/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-link" />
                  </div>
                  <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Security First</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[280px]">
                    Your token is processed locally. We never store or transmit your credentials to our servers.
                </p>
              </div>
              
              <div className="bg-background/50 p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-3 h-3 text-link" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Required Scopes</span>
                </div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {['repo', 'contents', 'workflow', 'metadata'].map((scope) => (
                    <li key={scope} className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                      <CheckCircle2 className="w-3 h-3 text-link shrink-0" />
                      {scope}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

      </motion.div>
    </div>
  );
};

