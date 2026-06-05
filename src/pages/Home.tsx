import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, Github, Shield, Globe, ChevronRight, 
  ArrowRight, FileJson, GitBranch, Lock, 
  CheckCircle2, Plus
} from 'lucide-react';
import { Footer } from '../components/Footer';

/* ── FAQ data ─────────────────────────────────── */
const faqs = [
  {
    q: "What permissions does RemoteConfig.io need?",
    a: "A GitHub Personal Access Token (classic) with repo scope for private repos and read:user for profile display. That's it — no more, no less."
  },
  {
    q: "Is my token stored on your servers?",
    a: "Never. RemoteConfig.io is a static, client-side app. Your token lives only in your browser's localStorage and is sent directly to GitHub's API. We have no server that ever touches it."
  },
  {
    q: "How do I fetch my config inside my app?",
    a: "Your config is a plain JSON file in a GitHub repo. Fetch it via GitHub's raw content URL or REST API from any HTTP client. No SDK required."
  },
  {
    q: "Can I undo changes made through the dashboard?",
    a: "Yes. Every save is a standard Git commit. Use GitHub's UI or any Git client to revert, view diffs, or restore previous states."
  },
  {
    q: "Does it support nested JSON?",
    a: "Yes. The visual builder handles deeply nested objects and arrays. Switch between visual mode and raw JSON mode at any time."
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
};

export function Home() {
  return (
    <>
      <div className="max-w-[1280px] mx-auto px-6">

        {/* ── HERO — white ──────────────────────── */}
        <section className="py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="eyebrow text-[#737373] mb-6">The GitHub-native config platform</p>
            <h1 className="display-xl text-black mb-8 max-w-3xl">
              Your config.<br />
              <span className="opacity-30">Zero infrastructure.</span>
            </h1>
            <p className="body-lg text-[#3d3d3d] max-w-xl mb-10 opacity-80" style={{ fontWeight: 330 }}>
              Manage production settings in real-time directly from your GitHub repositories.
              No backend. No lock-in. Full audit trail.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="btn-primary gap-2">
                Get started free <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/docs" className="btn-secondary border border-[#e5e5e5]">
                Documentation
              </Link>
            </div>
          </motion.div>

          {/* Stat pills */}
          <div className="mt-16 flex flex-wrap gap-3">
            {[
              { label: 'Architecture', val: 'Serverless' },
              { label: 'Storage', val: 'Git-Based' },
              { label: 'Format', val: 'JSON / YAML' },
              { label: 'Security', val: 'Token-Only' },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#e5e5e5] bg-[#f9f9f9]">
                <span className="caption text-[#737373]">{label}</span>
                <span className="w-px h-3 bg-[#e5e5e5]" />
                <span className="body-sm text-black" style={{ fontWeight: 480, fontSize: 13 }}>{val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── LIME BLOCK — "How it works" ────────── */}
        <section className="color-block color-block-lime section-gap">
          <div className="max-w-2xl">
            <p className="eyebrow text-black/50 mb-4">How it works</p>
            <h2 className="display-lg text-black mb-8">
              GitHub is your backend.
            </h2>
            <p className="subhead text-black/70 mb-10" style={{ fontWeight: 330 }}>
              Store your JSON config files in any GitHub repository.
              RemoteConfig.io reads and writes them via the GitHub API — giving you
              real-time updates, full version history, and zero server costs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
              {[
                { n: '01', title: 'Connect', body: 'Paste your GitHub token. We verify and load your repos instantly.' },
                { n: '02', title: 'Edit', body: 'Use the visual builder or raw JSON editor to update your config.' },
                { n: '03', title: 'Ship', body: 'Saved changes become Git commits. Your app reads the updated file immediately.' },
              ].map(({ n, title, body }) => (
                <div key={n} className="bg-white/60 rounded-2xl p-6">
                  <p className="eyebrow text-black/40 mb-3">{n}</p>
                  <p className="headline text-black mb-2" style={{ fontSize: 18, fontWeight: 540 }}>{title}</p>
                  <p className="body-sm text-black/60" style={{ fontWeight: 320 }}>{body}</p>
                </div>
              ))}
            </div>
            <Link to="/login" className="btn-primary mt-10 inline-flex gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── WHITE — Features bento ────────────── */}
        <section className="section-gap">
          <p className="eyebrow text-[#737373] mb-4">Core capabilities</p>
          <h2 className="display-lg text-black mb-14 max-w-lg">
            Built for developers who ship.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'Real-time sync', body: 'Push changes instantly without redeploying. Powered by GitHub REST API.' },
              { icon: Github, title: 'GitHub native', body: 'No custom backend. Use your existing repositories as config stores.' },
              { icon: Shield, title: 'Token-only security', body: 'Your credentials never reach our servers. Ever. Client-side only.' },
              { icon: FileJson, title: 'Visual JSON builder', body: 'Edit deeply nested structures visually. Switch to raw mode anytime.' },
              { icon: GitBranch, title: 'Full audit trail', body: 'Every save is a Git commit. Revert, diff, and trace changes with standard tools.' },
              { icon: Globe, title: 'Global delivery', body: "Fetch from GitHub's raw CDN for low-latency config access worldwide." },
            ].map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                whileHover={{ y: -3 }}
                className="p-7 rounded-3xl border border-[#e5e5e5] bg-white group hover:border-black/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center mb-5 group-hover:bg-black group-hover:text-white transition-all">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="headline text-black mb-2" style={{ fontSize: 17, fontWeight: 540 }}>{title}</h3>
                <p className="body-sm text-[#737373]" style={{ fontWeight: 320 }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── NAVY BLOCK — Ship products ────────── */}
        <section className="color-block color-block-navy section-gap">
          <div className="max-w-2xl">
            <p className="eyebrow text-white/40 mb-6">Feature flagging</p>
            <h2 className="display-lg text-white mb-6">
              Ship faster.<br />Roll back instantly.
            </h2>
            <p className="subhead text-white/60 mb-10" style={{ fontWeight: 330 }}>
              Use any key in your config as a feature flag. Toggle features on or off
              without a deployment. Your team stays in sync because the config lives in Git.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                { label: 'Change propagated', val: 'Instantly' },
                { label: 'Deployment needed', val: 'Never' },
                { label: 'Rollback time', val: '1 Git revert' },
                { label: 'Infrastructure cost', val: '$0' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="eyebrow text-white/40 mb-1">{label}</p>
                  <p className="headline text-white" style={{ fontSize: 20, fontWeight: 540 }}>{val}</p>
                </div>
              ))}
            </div>
            <Link to="/login" className="btn-secondary inline-flex gap-2">
              Try it now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── CORAL BLOCK — Developer first ──────── */}
        <section className="color-block color-block-coral section-gap">
          <div className="max-w-2xl">
            <p className="eyebrow text-black/50 mb-4">Integration</p>
            <h2 className="display-lg text-black mb-6">
              Fetch config with any HTTP client.
            </h2>
            <p className="subhead text-black/60 mb-8" style={{ fontWeight: 330 }}>
              No SDK. No vendor API. Just a JSON file in a public GitHub repo
              — or a private one protected by your token.
            </p>
            <div className="bg-black rounded-2xl p-6 font-mono text-sm text-white mb-8 overflow-x-auto">
              <p className="text-white/40 mb-2">// Fetch your config anywhere</p>
              <p><span className="text-[#d4f57a]">const</span> config = <span className="text-[#f7c4a8]">await</span> fetch(</p>
              <p className="pl-4 text-[#b8f0d8]">'https://raw.githubusercontent.com/you/repo/main/config.json'</p>
              <p>).<span className="text-[#d9c4f5]">then</span>(r =&gt; r.json());</p>
            </div>
            <Link to="/docs" className="btn-primary inline-flex gap-2">
              Read the docs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── LIME BLOCK — FAQ ──────────────────── */}
        <section className="color-block color-block-lime section-gap">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow text-black/50 text-center mb-4">FAQ</p>
            <h2 className="display-lg text-black text-center mb-12">
              Common questions.
            </h2>
            <div className="space-y-3">
              {faqs.map(({ q, a }, i) => (
                <details key={i} className="group bg-white/70 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 480, fontSize: 17 }}>
                    {q}
                    <Plus className="w-4 h-4 shrink-0 group-open:rotate-45 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 body-sm text-[#3d3d3d]" style={{ fontWeight: 320 }}>{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHITE — CTA closer ────────────────── */}
        <section className="section-gap text-center py-20">
          <p className="eyebrow text-[#737373] mb-6">Ready?</p>
          <h2 className="display-lg text-black mb-6 mx-auto max-w-2xl">
            Connect GitHub.<br />Start in 5 minutes.
          </h2>
          <p className="body-lg text-[#737373] mb-10 max-w-md mx-auto" style={{ fontWeight: 330 }}>
            No credit card. No server setup. Just a GitHub token and a repository.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/login" className="btn-primary gap-2">
              Get started free <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/docs" className="btn-secondary border border-[#e5e5e5]">
              Read the docs
            </Link>
          </div>
        </section>
      </div>

      <Footer />

      {/* SEO: FAQPage schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}

export default Home;
