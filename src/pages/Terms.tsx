import { motion } from 'framer-motion';
import { Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

interface TermsProps {
  onNavigate: (page: string) => void;
}

export const Terms: React.FC<TermsProps> = ({ onNavigate }) => {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="Serverless Dashboard terms of service: software provided as-is, no warranty, user responsibility for GitHub credentials, client-side tool with no server infrastructure."
        keywords="terms of service, Serverless Dashboard terms, software disclaimer, acceptable use, service availability, github compliance"
        canonical="/terms"
        ogType="website"
      />

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
                <Scale className="w-3 h-3" aria-hidden="true" />
                <span>Terms of Service</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Usage Guidelines</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                By using Serverless Dashboard, you agree to the following terms and conditions. 
                We aim to keep our terms as simple and transparent as our software.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-500" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold">Disclaimer</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This software is provided "as is", without warranty of any kind. 
                  Serverless Dashboard is not responsible for any data loss or production issues 
                  resulting from configuration changes.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold">Acceptable Use</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You are responsible for maintaining the security of your GitHub credentials. 
                  Use this tool in compliance with GitHub's official terms of service.
                </p>
              </div>
            </div>

            <div className="space-y-8 prose prose-invert max-w-none">
              <section className="space-y-4" aria-labelledby="availability-heading">
                <h2 id="availability-heading" className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-link" aria-hidden="true" />
                  Service Availability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Serverless Dashboard is a client-side tool. While we strive for 100% availability 
                  of this interface, the underlying storage and data delivery are dependent 
                  on GitHub's infrastructure.
                </p>
              </section>

              <section className="space-y-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-8">
                <p>Last updated: May 17, 2026</p>
                <p>
                  Serverless Dashboard reserves the right to modify these terms at any time.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    </>
  );
};
