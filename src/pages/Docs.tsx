import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Key,
  HelpCircle,
  GitBranch,
  UserCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Github,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Footer } from '../components/Footer';

// ── Image imports ──────────────────────────────────────────────
import imgGoToSettings from '../assets/images/GoToSettings.png';
import imgDeveloperSettings from '../assets/images/GoToDeveloperSettings.png';
import imgClickTokensClassic from '../assets/images/ClickTokens(classic).png';
import imgClickGenerateToken from '../assets/images/ClickGenerateNewToken.png';
import imgAddNameForToken from '../assets/images/AddNameForaToken.png';
import imgAddRepoRules from '../assets/images/AddRules2(RepoRules).png';
import imgAddUserRules from '../assets/images/AddRules1(UserProfileRules).png';
import imgCopyToken from '../assets/images/CopyToken.png';

// ── Helpers ────────────────────────────────────────────────────
const DecorativeUnderline = () => (
  <svg className="absolute -bottom-1 left-0 w-full h-2 text-link/30" viewBox="0 0 100 10" preserveAspectRatio="none">
    <path d="M0 5 Q 25 2, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const StepBadge = ({ n }: { n: number }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-9 h-9 rounded-full bg-link text-white flex items-center justify-center font-bold text-sm border-4 border-background shrink-0">
      {n}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Step {n}</span>
  </div>
);

const StepImage = ({ src, alt }: { src: string; alt: string }) => (
  <div className="rounded-2xl overflow-hidden border border-border shadow-2xl transition-transform hover:scale-[1.01] duration-500 mt-6">
    <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
  </div>
);

const TipBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 p-4 rounded-xl bg-link/5 border border-link/20 text-sm text-muted-foreground leading-relaxed">
    <Lightbulb className="w-4 h-4 text-link shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm font-semibold text-orange-600 leading-relaxed">
    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

// ── Structured data for SEO (HowTo schema) ────────────────────
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Create a GitHub Personal Access Token for RemoteConfig.io",
  "description": "A step-by-step guide to generating a GitHub Personal Access Token (Classic) to authorize RemoteConfig.io.",
  "totalTime": "PT5M",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Create a GitHub Account & Repository", "text": "Sign up at github.com and create a new repository to store your config files." },
    { "@type": "HowToStep", "position": 2, "name": "Go to Settings", "text": "Click your profile picture in the top-right corner and select Settings." },
    { "@type": "HowToStep", "position": 3, "name": "Open Developer Settings", "text": "Scroll to the bottom of the left sidebar and click Developer settings." },
    { "@type": "HowToStep", "position": 4, "name": "Navigate to Tokens (Classic)", "text": "Go to Personal access tokens → Tokens (classic)." },
    { "@type": "HowToStep", "position": 5, "name": "Generate New Token", "text": "Click Generate new token → Generate new token (classic)." },
    { "@type": "HowToStep", "position": 6, "name": "Set Name & Expiration", "text": "Fill in the Note field with a purpose name and pick an expiration date." },
    { "@type": "HowToStep", "position": 7, "name": "Select Required Scopes", "text": "Check repo (full repo access) and read:user (profile read). These two are required." },
    { "@type": "HowToStep", "position": 8, "name": "Copy & Paste Your Token", "text": "Click Generate token and immediately copy the code. Paste it into the Authorization field on RemoteConfig.io." }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://remoteconfig.io/" },
    { "@type": "ListItem", "position": 2, "name": "Documentation", "item": "https://remoteconfig.io/docs" }
  ]
};

// ── Component ─────────────────────────────────────────────────
interface DocsProps {
  onNavigate: (page: string) => void;
}

export const Docs: React.FC<DocsProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-24 pb-20 min-h-screen pt-12 px-6 lg:px-12">
      <div className="space-y-24 py-8 rounded-[48px] border border-border/50 bg-background shadow-xl shadow-primary/5 relative overflow-hidden">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-link/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-3xl relative z-10 text-center mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/20">
              <Key className="w-3 h-3" />
              <span>Setup Guide · ~5 minutes</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
              Connect Your{' '}
              <span className="relative inline-block">
                <span className="text-link">GitHub Account</span>
                <DecorativeUnderline />
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              You'll need a <strong>GitHub Personal Access Token</strong> to authorize RemoteConfig.io.
              This guide walks you through every step — no experience required.
            </p>

            {/* Quick prerequisite bar */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs">
              {[
                { icon: Github, label: 'A GitHub account' },
                { icon: BookOpen, label: 'A repo (or create one)' },
                { icon: CheckCircle2, label: '5 minutes of your time' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/50 text-muted-foreground font-medium">
                  <Icon className="w-3 h-3 text-link" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Steps ────────────────────────────────────────────── */}
        <main className="max-w-6xl mx-auto space-y-4 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className=" relative overflow-hidden space-y-20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-link/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-link/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-link" />
              </div>
              <h2 className="text-2xl font-bold">GitHub Token — Step by Step</h2>
            </div>

            {/* ── PRE-STEP: Create Account & Repo ─────────────── */}
            <div className="p-6 rounded-2xl bg-link/5 border border-link/20 space-y-3">
              <div className="flex items-center gap-2 text-link font-bold text-sm">
                <Github className="w-4 h-4" />
                Before You Start
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If you don't have a GitHub account yet,{' '}
                <a href="https://github.com/join" target="_blank" rel="noopener noreferrer" className="text-link font-semibold hover:underline inline-flex items-center gap-1">
                  sign up for free at github.com <ExternalLink className="w-3 h-3" />
                </a>.
                Once you're in, <strong>create a new repository</strong> — this is where your JSON config files will live.
                You can name it anything, like <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">my-app-config</code>.
              </p>
            </div>

            {/* ── STEP 1 ──────────────────────────────────────── */}
            <div className="space-y-4">
              <StepBadge n={1} />
              <h3 className="text-2xl font-bold">Go to Settings</h3>
              <p className="text-muted-foreground leading-relaxed">
                Log in to your GitHub account. Click your <strong>profile picture</strong> in the top-right corner of the page.
                A dropdown will appear — select <strong>Settings</strong> from the list.
              </p>
              <TipBox>Your profile photo is in the very top-right corner of any GitHub page. Can't find it? Look for a small circle with your avatar.</TipBox>
              <StepImage src={imgGoToSettings} alt="Click profile icon then Settings in GitHub" />
            </div>

            {/* ── STEP 2 ──────────────────────────────────────── */}
            <div className="space-y-4">
              <StepBadge n={2} />
              <h3 className="text-2xl font-bold">Open Developer Settings</h3>
              <p className="text-muted-foreground leading-relaxed">
                On the Settings page, look at the <strong>left sidebar</strong>. Scroll all the way down to the very bottom.
                You'll see a link called <strong>Developer settings</strong> — click it.
                This is where all API and token configurations live.
              </p>
              <TipBox>It's easy to miss because it's at the very bottom. If you can't find it, press <kbd className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">Ctrl + F</kbd> and search for "Developer settings".</TipBox>
              <StepImage src={imgDeveloperSettings} alt="Developer settings link at bottom of GitHub sidebar" />
            </div>

            {/* ── STEP 3 ──────────────────────────────────────── */}
            <div className="space-y-4">
              <StepBadge n={3} />
              <h3 className="text-2xl font-bold">Click Personal Access Tokens → Tokens (Classic)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Inside Developer Settings, click <strong>Personal access tokens</strong> to expand it,
                then click <strong>Tokens (classic)</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                <em>Why Classic?</em> The classic token format provides the most reliable compatibility for tools like RemoteConfig.io.
                Fine-grained tokens are more restrictive and may not work correctly with all GitHub API endpoints we use.
              </p>
              <StepImage src={imgClickTokensClassic} alt="Personal access tokens → Tokens (classic) in GitHub" />
            </div>

            {/* ── STEP 4 ──────────────────────────────────────── */}
            <div className="space-y-4">
              <StepBadge n={4} />
              <h3 className="text-2xl font-bold">Generate New Token (Classic)</h3>
              <p className="text-muted-foreground leading-relaxed">
                On the Tokens (classic) page, find the <strong>Generate new token</strong> dropdown button near the top right.
                Click it and select <strong>Generate new token (classic)</strong> from the menu.
                This takes you to the token configuration form.
              </p>
              <StepImage src={imgClickGenerateToken} alt="Generate new token (classic) dropdown in GitHub" />
            </div>

            {/* ── STEP 5 ──────────────────────────────────────── */}
            <div className="space-y-4">
              <StepBadge n={5} />
              <h3 className="text-2xl font-bold">Add a Name & Set Expiration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Fill in the <strong>Note</strong> field with a clear, descriptive name — for example{' '}
                <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">RemoteConfig Access</code>.
                This helps you remember what the token is for later.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Then set an <strong>Expiration</strong> date. We recommend <em>90 days</em> — short enough to be secure,
                long enough that you won't need to renew it constantly.
              </p>
              <TipBox>Give your token a specific name like the app it's for. If you ever need to revoke it, a clear name saves you from guessing.</TipBox>
              <StepImage src={imgAddNameForToken} alt="Adding a note/name and expiration to the GitHub token" />
            </div>

            {/* ── STEP 6 ──────────────────────────────────────── */}
            <div className="space-y-6">
              <StepBadge n={6} />
              <h3 className="text-2xl font-bold">
                Select the Required Scopes{' '}
                <span className="text-sm text-orange-500 font-bold ml-1">⚠ Important</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Scopes are <strong>permissions</strong> — they control what your token is allowed to do.
                You must select <strong>exactly two</strong> scopes for RemoteConfig.io to work correctly:
              </p>

              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                {/* repo scope */}
                <div className="p-6 rounded-2xl bg-background border border-border hover:border-blue-500/30 transition-colors space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <GitBranch className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <code className="font-bold text-sm">repo</code>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Full repo access</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This lets RemoteConfig.io <strong>read and write files</strong> in your GitHub repositories.
                    Without it, the app can't load or save your JSON config files.
                  </p>
                  <div className="rounded-xl overflow-hidden border border-border/50">
                    <img src={imgAddRepoRules} alt="Selecting repo scope in GitHub token form" className="w-full h-auto" loading="lazy" />
                  </div>
                </div>

                {/* read:user scope */}
                <div className="p-6 rounded-2xl bg-background border border-border hover:border-green-500/30 transition-colors space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <UserCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <code className="font-bold text-sm">read:user</code>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Profile read</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This allows RemoteConfig.io to <strong>read your GitHub username and avatar</strong>.
                    It's used only to display your profile inside the dashboard so you know you're connected.
                    <em> We never store or share this data.</em>
                  </p>
                  <div className="rounded-xl overflow-hidden border border-border/50">
                    <img src={imgAddUserRules} alt="Selecting read:user scope in GitHub token form" className="w-full h-auto" loading="lazy" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 border border-border text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Only these two scopes.</strong>{' '}
                Don't select anything else — keeping permissions minimal is a security best practice.
                More scopes = more risk if your token is ever exposed.
              </div>
            </div>

            {/* ── STEP 7 ──────────────────────────────────────── */}
            <div className="space-y-4">
              <StepBadge n={7} />
              <h3 className="text-2xl font-bold">Copy Your Token & Paste It</h3>
              <p className="text-muted-foreground leading-relaxed">
                Scroll to the bottom of the form and click the green <strong>Generate token</strong> button.
                GitHub will display your token — a long string starting with <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">ghp_</code>.
              </p>
              <WarningBox>
                GitHub shows your token <strong>only once</strong>. Copy it immediately and paste it somewhere safe.
                If you close this page without copying, you'll have to generate a brand new token.
              </WarningBox>
              <p className="text-muted-foreground leading-relaxed">
                Once copied, go back to the <strong>RemoteConfig.io login page</strong> and paste it into the{' '}
                <strong>Authorization</strong> field. That's it — you're in!
              </p>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border text-sm text-muted-foreground">
                🔒 <strong className="text-foreground">Your token stays on your device.</strong>{' '}
                RemoteConfig.io stores it only in your browser's local storage and sends it directly to GitHub's API.
                We never see or store it on our servers.
              </div>
              <StepImage src={imgCopyToken} alt="Copy the generated GitHub personal access token" />
            </div>

            {/* ── Done ─────────────────────────────────────────── */}
            <div className="pt-8 flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
              <div className="max-w-md space-y-3">
                <h3 className="text-3xl font-bold">You're All Set! 🎉</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Paste your token into the <strong>Authorization</strong> field on the login page.
                  You'll instantly get access to your configuration dashboard.
                </p>
              </div>
              <Button
                onClick={() => onNavigate('dashboard')}
                className="rounded-2xl h-12 px-8 bg-link text-white font-bold text-base hover:scale-105 transition-transform gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* ── Support ──────────────────────────────────────────── */}
          <section className="bg-secondary/30 p-12 md:p-16 rounded-[64px] border border-border/50 text-center space-y-8 mt-12">
            <div className="w-16 h-16 rounded-3xl bg-link/10 flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8 text-link" />
            </div>
            <div className="space-y-3 max-w-xl mx-auto">
              <h3 className="text-3xl font-bold tracking-tight">Still Stuck?</h3>
              <p className="text-muted-foreground leading-relaxed">
                If anything in this guide didn't work as expected, our community is here.
                You can also open an issue on GitHub and we'll help you debug it.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold gap-2">
                <Github className="w-4 h-4" />
                View GitHub Repo
              </Button>
              <Button variant="link" className="text-link font-bold gap-1">
                Contact Support
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </section>
        </main>

        <Footer onNavigate={onNavigate} />

        {/* SEO: HowTo Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </div>
    </div>
  );
};
