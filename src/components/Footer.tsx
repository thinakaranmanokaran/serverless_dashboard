import React from 'react';
import { Github } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="pt-20 border-t border-border/50 px-6 pb-12 flex flex-col md:flex-row justify-between items-center gap-8 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col items-center md:items-start gap-4">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-8 h-8 rounded-lg bg-link/5 p-1 border border-border group-hover:scale-110 transition-transform">
            <img src="/logo.png" alt="RemoteConfig.io" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight">RemoteConfig<span className="text-link">.io</span></span>
        </div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Developed by <a href="https://thinakaran.dev/" target="_blank" rel="noopener noreferrer" className="text-link hover:underline">Thinakaran Manokaran</a>
        </p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        <button onClick={() => onNavigate('privacy')} className="hover:text-link transition-colors cursor-pointer">Privacy</button>
        <button onClick={() => onNavigate('terms')} className="hover:text-link transition-colors cursor-pointer">Terms</button>
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-link transition-colors flex items-center gap-1.5">
          <Github className="w-3.5 h-3.5" />
          Open Source
        </a>
        <span className="text-link">© 2026</span>
      </div>
    </footer>
  );
};
