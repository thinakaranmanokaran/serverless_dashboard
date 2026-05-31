import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  HelpCircle, 
  Search, 
  Zap, 
  Shield, 
  Github, 
  Globe, 
  Cpu,
  Layers,
  ArrowUpRight,
  MessageCircle,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '../components/ui/accordion';
import { Footer } from '../components/Footer';

const DecorativeUnderline = () => (
  <svg className="absolute -bottom-2 left-0 w-full h-3 text-link/40" viewBox="0 0 100 10" preserveAspectRatio="none">
    <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface HomeProps {
  onStart: () => void;
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onStart, onNavigate }) => {
  const features = [
    {
      title: "Real-time Sync",
      description: "Push changes to your application instantly without redeploying. Powered by the GitHub REST API for reliable, version-controlled delivery.",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "GitHub Native",
      description: "No custom backend required. Use your existing GitHub repositories as a secure, distributed configuration store with full audit logs.",
      icon: Github,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Secure Vault",
      description: "Your tokens never leave your browser. We provide a client-side interface that interacts directly with GitHub, ensuring zero data persistence on our end.",
      icon: Shield,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Global Edge",
      description: "Leverage GitHub's global infrastructure for configuration delivery, providing low-latency access to your app settings anywhere in the world.",
      icon: Globe,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  const faqs = [
    {
      question: "What permissions does RemoteConfig.io require?",
      answer: "We require a GitHub Personal Access Token (PAT) with 'repo' scope for private repositories or 'public_repo' for public ones. This allows us to list files and commit configuration changes as you."
    },
    {
      question: "Is my GitHub token stored on your servers?",
      answer: "Absolutely not. This is a static-first application. Your token is stored in your browser's localStorage and only sent to the GitHub API. We have no backend database for user credentials."
    },
    {
      question: "How do I integrate the configuration into my app?",
      answer: "Since your config is a standard JSON file in a GitHub repo, you can fetch it using any standard HTTP client or GitHub's Raw content URL. For production, we recommend using a CDN proxy or caching the response."
    },
    {
      question: "Can I undo changes Made through the dashboard?",
      answer: "Yes! Every save through RemoteConfig.io is a standard Git commit. You can use the GitHub UI or any Git client to revert changes, view history, and see exactly who changed what."
    },
    {
      question: "Does it support nested JSON structures?",
      answer: "Yes, our Visual Builder automatically parses nested objects and lists. You can toggle between the Visual Editor and Raw JSON mode at any time for total control."
    }
  ];

  const stats = [
    { label: "Architecture", value: "Serverless" },
    { label: "Storage", value: "Git-Based" },
    { label: "Format", value: "JSON/YAML" },
    { label: "Integrity", value: "Verifiable" }
  ];

  return (
    <div className="space-y-20 pb-20 min-h-screen pt-12 px-6 lg:px-12">
      {/* Hero Section - Organic Layout */}
      <section className="relative py-20 px-8 lg:px-16 overflow-hidden rounded-[48px] border border-border/50 bg-background shadow-2xl shadow-primary/5">
        {/* Modern Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-link/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-widest mb-6 border border-border/50">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>v2.0 Now Live - Enhanced Sync</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-8">
              The evolution of <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-link">Fluid Config</span>
                <DecorativeUnderline />
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10">
              Breath life into your applications with instant, version-controlled updates. 
              A sanctuary for your production variables, built naturally upon GitHub's proven ecosystem.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={onStart}
                className="h-14 px-8 rounded-2xl text-lg font-semibold gap-2 transition-all"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 rounded-2xl text-lg font-semibold border-border bg-background/50 backdrop-blur-sm"
                onClick={onStart}
              >
                Documentation
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 + 0.5 }}
              className="p-6 rounded-3xl bg-secondary/30 hairline flex flex-col gap-1 border border-border/50"
            >
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</span>
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Must Section - Feature Grid */}
      <section className="px-6 space-y-12">
        <div className="max-w-2xl">
          <h2 className="text-[12px] font-bold text-link uppercase tracking-[0.3em] mb-4">Core Principles</h2>
          <h3 className="text-4xl font-bold tracking-tight text-foreground relative inline-block">
            Why teams choose our GitHub-native approach
            <DecorativeUnderline />
          </h3>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Conventional remote config tools lock you into proprietary databases. 
            We believe your configuration is code, and it belongs in your version control system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Bento Item 1 - Large */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-2 md:row-span-2 p-10 rounded-[40px] bg-card border border-border/50 group transition-all relative overflow-hidden flex flex-col justify-end"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-64 h-64 text-amber-500 -mr-20 -mt-20" />
            </div>
            <div className={`w-14 h-14 rounded-2xl ${features[0].bg} flex items-center justify-center mb-6`}>
              {React.createElement(features[0].icon, { className: `w-7 h-7 ${features[0].color}` })}
            </div>
            <h4 className="text-3xl font-bold text-foreground mb-4">{features[0].title}</h4>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-md">
              {features[0].description}
            </p>
          </motion.div>

          {/* Bento Item 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-1 p-8 rounded-[40px] bg-secondary/30 border border-border/50 group transition-all hover:bg-secondary/50 flex flex-col"
          >
            <div className={`w-12 h-12 rounded-xl ${features[1].bg} flex items-center justify-center mb-6`}>
              {React.createElement(features[1].icon, { className: `w-6 h-6 ${features[1].color}` })}
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2">{features[1].title}</h4>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {features[1].description}
            </p>
          </motion.div>

          {/* Bento Item 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-1 p-8 rounded-[40px] bg-card border border-border/50 group transition-all flex flex-col"
          >
            <div className={`w-12 h-12 rounded-xl ${features[2].bg} flex items-center justify-center mb-6`}>
              {React.createElement(features[2].icon, { className: `w-6 h-6 ${features[2].color}` })}
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2">{features[2].title}</h4>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {features[2].description}
            </p>
          </motion.div>

          {/* Bento Item 4 - Wide bottom */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-3 p-10 rounded-[40px] bg-gradient-to-r from-secondary/50 to-background border border-border/50 flex flex-col md:flex-row items-center gap-10"
          >
             <div className={`w-16 h-16 rounded-2xl ${features[3].bg} flex items-center justify-center shrink-0`}>
              {React.createElement(features[3].icon, { className: `w-8 h-8 ${features[3].color}` })}
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-foreground">{features[3].title}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {features[3].description}
              </p>
            </div>
            <div className="ml-auto">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-background bg-link text-white text-[10px] font-bold flex items-center justify-center">
                  +1k
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section - SEO/GEO Optimized */}
      <section className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 py-20 bg-secondary/20 rounded-[48px] border border-border/30">
        <div className="lg:col-span-1 space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-4xl font-bold tracking-tight">Common Knowledge Base</h3>
          <p className="text-muted-foreground leading-relaxed">
            Everything you need to know about working with GitHub-based remote configurations. 
            Still have questions? Our community is here to help.
          </p>
          <div className="pt-4">
            <Button variant="link" className="px-0 text-link font-bold gap-2 hover:gap-3 transition-all">
              Contact Support
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem 
                key={idx} 
                value={`item-${idx}`}
                className="border border-border/50 bg-background/50 rounded-2xl px-6 data-[state=open]:border-primary/30 transition-all overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-6">
                  <span className="text-left font-bold text-lg text-foreground hover:text-link transition-colors">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-md leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer onNavigate={onNavigate} />

      {/* SEO - FAQPage JSON-LD (eligible for Google FAQ rich results) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": { "@type": "Answer", "text": f.answer }
          }))
        }) }} />
    </div>
  );
};
