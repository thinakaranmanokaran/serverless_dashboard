import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, Server, FileText } from 'lucide-react';
import { Footer } from '../components/Footer';

interface PrivacyProps {
  onNavigate: (page: string) => void;
}

export const Privacy: React.FC<PrivacyProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-link/10 text-link text-[10px] font-bold uppercase tracking-widest border border-link/20">
              <Shield className="w-3 h-3" />
              <span>Privacy Policy</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Our Privacy Commitment</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              At RemoteConfig.io, privacy isn't a feature—it's our foundation. 
              We've architected everything to ensure your sensitive data never touches our systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Zero Credential Storage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your GitHub Personal Access Tokens are stored exclusively in your browser's local storage. 
                They are never transmitted to, or stored on, our servers. 
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">Direct Communication</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our application communicates directly with the GitHub API from your browser. 
                There is no intermediate "proxy" server that can inspect your data.
              </p>
            </div>
          </div>

          <div className="space-y-8 prose prose-invert max-w-none">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-link" />
                Information We Don't Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not track your activity, collect your personal information, or monetize your data. 
                Our interest is solely in providing a high-quality interface for managing your configurations.
              </p>
            </section>

            <section className="space-y-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-8">
              <p>Last updated: May 17, 2026</p>
              <p>
                If you have any questions about this privacy statement, please contact us via our GitHub repository.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};
