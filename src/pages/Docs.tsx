import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Key, HelpCircle, GitBranch, AlertTriangle, 
  CheckCircle2, ExternalLink, ArrowRight, Github, Lightbulb, UserCircle
} from 'lucide-react';
import { Footer } from '../components/Footer';

import imgGoToSettings       from '../assets/images/GoToSettings.png';
import imgDeveloperSettings  from '../assets/images/GoToDeveloperSettings.png';
import imgClickTokensClassic from '../assets/images/ClickTokens(classic).png';
import imgClickGenerateToken from '../assets/images/ClickGenerateNewToken.png';
import imgAddNameForToken    from '../assets/images/AddNameForaToken.png';
import imgAddRepoRules       from '../assets/images/AddRules2(RepoRules).png';
import imgAddUserRules       from '../assets/images/AddRules1(UserProfileRules).png';
import imgCopyToken          from '../assets/images/CopyToken.png';

const TipBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 p-4 rounded-2xl bg-[#f5f5f5] text-sm leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 320 }}>
    <Lightbulb className="w-4 h-4 text-black shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 p-4 rounded-2xl bg-[#d4f57a] text-sm font-semibold leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 480 }}>
    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const StepImage = ({ src, alt }: { src: string; alt: string }) => (
  <div className="rounded-2xl overflow-hidden border border-[#e5e5e5] mt-5 hover:border-black/20 transition-colors">
    <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
  </div>
);

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Create a GitHub Personal Access Token for RemoteConfig.io",
  "description": "Step-by-step guide to generating a GitHub PAT (Classic) to authorize RemoteConfig.io in under 5 minutes.",
  "totalTime": "PT5M",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Create GitHub account & repo", "text": "Sign up at github.com and create a repository to store your config files." },
    { "@type": "HowToStep", "position": 2, "name": "Go to Settings", "text": "Click your profile picture (top-right) and select Settings." },
    { "@type": "HowToStep", "position": 3, "name": "Open Developer Settings", "text": "Scroll to the bottom of the left sidebar and click Developer settings." },
    { "@type": "HowToStep", "position": 4, "name": "Navigate to Tokens (Classic)", "text": "Go to Personal access tokens → Tokens (classic)." },
    { "@type": "HowToStep", "position": 5, "name": "Generate New Token", "text": "Click Generate new token → Generate new token (classic)." },
    { "@type": "HowToStep", "position": 6, "name": "Set Name & Expiration", "text": "Fill in the Note field and choose an expiration date (90 days recommended)." },
    { "@type": "HowToStep", "position": 7, "name": "Select repo and read:user scopes", "text": "Check repo (full repo access) and read:user (profile read). Only these two are required." },
    { "@type": "HowToStep", "position": 8, "name": "Copy & paste your token", "text": "Click Generate token, copy it immediately (shown once), and paste into RemoteConfig.io Authorization." }
  ]
};

export function Docs() {
  return (
    <>
      <div className="max-w-[1280px] mx-auto px-6">

        {/* ── Hero — white ─────────────────────── */}
        <section className="py-20">
          <p className="eyebrow text-[#737373] mb-5">Setup Guide · ~5 minutes</p>
          <h1 className="display-xl text-black mb-6 max-w-2xl">
            Connect your GitHub account.
          </h1>
          <p className="body-lg text-[#3d3d3d]" style={{ fontWeight: 330 }}>
            You need a <strong style={{ fontWeight: 540 }}>GitHub Personal Access Token</strong> to authorize RemoteConfig.io.
            This guide walks through every step clearly.
          </p>
          {/* Prerequisite pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { icon: Github, label: 'A GitHub account' },
              { icon: CheckCircle2, label: 'A repo (or create one)' },
              { icon: Key, label: '5 minutes' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#e5e5e5] bg-[#f9f9f9] text-sm">
                <Icon className="w-3.5 h-3.5 text-black" />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 340 }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── LIME BLOCK — full guide ───────────── */}
        <section className="color-block color-block-lime section-gap max-w-5xl mx-auto">
          <div className="">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                <Key className="w-4 h-4 text-white" />
              </div>
              <h2 className="headline text-black" style={{ fontSize: 22 }}>GitHub Token — Step by Step</h2>
            </div>

            {/* Pre-step */}
            <div className="bg-white/70 rounded-2xl p-6 mb-12 border border-black/10">
              <p className="eyebrow text-black/50 mb-3">Before you start</p>
              <p className="body-sm text-black/70 leading-relaxed" style={{ fontWeight: 320 }}>
                No account yet?{' '}
                <a href="https://github.com/join" target="_blank" rel="noopener noreferrer" className="text-black font-semibold hover:underline inline-flex items-center gap-1">
                  Sign up at github.com <ExternalLink className="w-3 h-3" />
                </a>.{' '}
                Then <strong style={{ fontWeight: 540 }}>create a new repository</strong> — any name works, like{' '}
                <code className="bg-black/10 px-1.5 py-0.5 rounded text-xs font-mono">my-app-config</code>.
                This is where your JSON config files will live.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-16">
              {[
                {
                  n: 1,
                  title: 'Go to Settings',
                  body: <>Click your <strong style={{ fontWeight: 540 }}>profile picture</strong> in the top-right corner. Select <strong style={{ fontWeight: 540 }}>Settings</strong> from the dropdown.</>,
                  tip: "Your avatar is always top-right on any GitHub page. If you can't spot it, press Ctrl+F and search for your username.",
                  img: { src: imgGoToSettings, alt: 'Click profile then Settings' }
                },
                {
                  n: 2,
                  title: 'Open Developer Settings',
                  body: <>Scroll to the <strong style={{ fontWeight: 540 }}>very bottom</strong> of the left sidebar. Click <strong style={{ fontWeight: 540 }}>Developer settings</strong>. This is where all API and token configs live.</>,
                  tip: "It's easy to miss because it's at the bottom. Use Ctrl+F → 'Developer' to find it fast.",
                  img: { src: imgDeveloperSettings, alt: 'Developer settings link' }
                },
                {
                  n: 3,
                  title: 'Personal Access Tokens → Tokens (Classic)',
                  body: <>Expand <strong style={{ fontWeight: 540 }}>Personal access tokens</strong>, then click <strong style={{ fontWeight: 540 }}>Tokens (classic)</strong>. Classic tokens have the best compatibility for tools like RemoteConfig.io.</>,
                  tip: "Why classic? Fine-grained tokens are more restrictive and may block some GitHub API endpoints we depend on.",
                  img: { src: imgClickTokensClassic, alt: 'Tokens (classic) navigation' }
                },
                {
                  n: 4,
                  title: 'Generate New Token (Classic)',
                  body: <>Click the <strong style={{ fontWeight: 540 }}>Generate new token</strong> dropdown (top right of the page). Select <strong style={{ fontWeight: 540 }}>Generate new token (classic)</strong>.</>,
                  tip: undefined,
                  img: { src: imgClickGenerateToken, alt: 'Generate new token dropdown' }
                },
                {
                  n: 5,
                  title: 'Add a Name & Set Expiration',
                  body: <>In the <strong style={{ fontWeight: 540 }}>Note</strong> field, enter something like <code className="bg-black/10 px-1.5 py-0.5 rounded text-xs font-mono">RemoteConfig Access</code>. Then set <strong style={{ fontWeight: 540 }}>Expiration</strong> — we recommend <em>90 days</em>.</>,
                  tip: "Name it clearly so you know what it's for later. If you revoke the wrong token, a clear name saves the day.",
                  img: { src: imgAddNameForToken, alt: 'Token name and expiration' }
                },
              ].map(({ n, title, body, tip, img }) => (
                <motion.div key={n} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0" style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 500 }}>
                      {n}
                    </div>
                    <h3 className="headline text-black" style={{ fontSize: 20, fontWeight: 540 }}>{title}</h3>
                  </div>
                  <p className="body-sm text-black/70 ml-11 mb-4 leading-relaxed" style={{ fontWeight: 320 }}>{body}</p>
                  {tip && <div className="ml-11 mb-4"><TipBox>{tip}</TipBox></div>}
                  <div className="ml-11"><StepImage src={img.src} alt={img.alt} /></div>
                </motion.div>
              ))}

              {/* Step 6 — scopes (two-column) */}
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0" style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 500 }}>6</div>
                  <h3 className="headline text-black" style={{ fontSize: 20, fontWeight: 540 }}>
                    Select Required Scopes <span className="text-sm text-black/50 ml-2 font-normal">⚠ Important</span>
                  </h3>
                </div>
                <p className="body-sm text-black/70 ml-11 mb-6 leading-relaxed" style={{ fontWeight: 320 }}>
                  Scopes are <strong style={{ fontWeight: 540 }}>permissions</strong>. You need exactly two — nothing more, nothing less.
                </p>
                <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/70 rounded-2xl p-5 border border-black/10">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <code className="font-mono text-sm font-bold">repo</code>
                        <p className="eyebrow text-black/40 mt-0.5">Full repo access</p>
                      </div>
                    </div>
                    <p className="body-sm text-black/60 leading-relaxed mb-3" style={{ fontWeight: 320 }}>
                      Lets RemoteConfig.io <strong style={{ fontWeight: 540 }}>read and write files</strong> in your repos.
                      Without this, the app can't load or save your JSON config.
                    </p>
                    <div className="rounded-xl overflow-hidden border border-black/10">
                      <img src={imgAddRepoRules} alt="Select repo scope" className="w-full h-auto" loading="lazy" />
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-2xl p-5 border border-black/10">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center">
                        <UserCircle className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <code className="font-mono text-sm font-bold">read:user</code>
                        <p className="eyebrow text-black/40 mt-0.5">Profile read</p>
                      </div>
                    </div>
                    <p className="body-sm text-black/60 leading-relaxed mb-3" style={{ fontWeight: 320 }}>
                      Used to show your <strong style={{ fontWeight: 540 }}>GitHub username and avatar</strong> in the dashboard.
                      Only reads public profile data. <em>Never stored on our servers.</em>
                    </p>
                    <div className="rounded-xl overflow-hidden border border-black/10">
                      <img src={imgAddUserRules} alt="Select read:user scope" className="w-full h-auto" loading="lazy" />
                    </div>
                  </div>
                </div>
                <div className="ml-11">
                  <TipBox>Only these two scopes. Keeping permissions minimal is a security best practice — more scopes = more risk if the token is ever leaked.</TipBox>
                </div>
              </motion.div>

              {/* Step 7 — copy */}
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0" style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 500 }}>7</div>
                  <h3 className="headline text-black" style={{ fontSize: 20, fontWeight: 540 }}>Copy Your Token & Paste It</h3>
                </div>
                <div className="ml-11 space-y-4">
                  <p className="body-sm text-black/70 leading-relaxed" style={{ fontWeight: 320 }}>
                    Scroll down and click the green <strong style={{ fontWeight: 540 }}>Generate token</strong> button.
                    GitHub shows your token — a string starting with <code className="bg-black/10 px-1.5 py-0.5 rounded text-xs font-mono">ghp_</code>.
                  </p>
                  <WarningBox>
                    GitHub shows your token <strong>only once</strong>. Copy it immediately. If you close the page without copying, you'll need to generate a new one.
                  </WarningBox>
                  <p className="body-sm text-black/70 leading-relaxed" style={{ fontWeight: 320 }}>
                    Go back to the <strong style={{ fontWeight: 540 }}>RemoteConfig.io login page</strong> and paste the token into the <strong style={{ fontWeight: 540 }}>Authorization</strong> field.
                  </p>
                  <div className="p-4 rounded-2xl bg-white/70 border border-black/10 body-sm text-black/60" style={{ fontWeight: 320 }}>
                    🔒 <strong style={{ fontWeight: 540 }}>Your token stays on your device.</strong> RemoteConfig.io stores it only in your browser's localStorage and sends it directly to GitHub's API. We never see it.
                  </div>
                  <StepImage src={imgCopyToken} alt="Copy GitHub token" />
                </div>
              </motion.div>
            </div>

            {/* Done state */}
            <div className="mt-20 text-center">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="display-lg text-black mb-4" style={{ fontSize: 36 }}>You're all set! 🎉</h3>
              <p className="body-lg text-black/60 mx-auto mb-8" style={{ fontWeight: 330 }}>
                Paste your token on the login page and you'll be inside your dashboard instantly.
              </p>
              <Link to="/register" className="btn-primary inline-flex gap-2">
                Go to dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Support ──────────────────────────── */}
        <section className="section-gap py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-7 h-7 text-black" />
          </div>
          <h3 className="display-lg text-black mb-4" style={{ fontSize: 36 }}>Still stuck?</h3>
          <p className="body-lg text-[#737373] mx-auto mb-8" style={{ fontWeight: 330 }}>
            The community is here. Open a GitHub issue and we'll help you debug it.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="btn-primary inline-flex gap-2">
              <Github className="w-4 h-4" /> View GitHub repo
            </a>
            <a href="mailto:support@remoteconfig.io" className="btn-secondary border border-[#e5e5e5] inline-flex gap-2">
              Contact support <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://remoteconfig.io/" },
          { "@type": "ListItem", "position": 2, "name": "Documentation", "item": "https://remoteconfig.io/docs" }
        ]
      }) }} />
    </>
  );
}

export default Docs;
