import { useState } from 'react';
import { useGitHub } from '../hooks/useGitHub';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Shield, CheckCircle2, ChevronRight, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';

export function Login() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const { login, isLoading, error, clearError } = useGitHub();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) { toast.error('Please enter a token'); return; }
    try {
      await login(token.trim());
      toast.success('Connected to GitHub!');
      navigate('/dashboard');
    } catch {}
  };

  return (
    <>
      <SEO
        title="Connect GitHub - Authorize Serverless Dashboard"
        description="Paste your GitHub Personal Access Token to get started. Token stored only in your browser - never on our servers. Secure, private, client-side only."
        keywords="github login, personal access token, github authorization, Serverless Dashboard login, connect github, github token entry"
        canonical="/register"
        ogType="website"
        noIndex={true}
      />

      <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px]"
        >
          <div className="mb-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mx-auto mb-5 overflow-hidden">
              <img src="/favicon.png" alt="Serverless Dashboard logo" className="w-8 h-8 object-contain invert" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
            </div>
            <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 540, fontSize: 28, letterSpacing: '-0.4px', lineHeight: 1.1 }} className="text-black mb-2">
              Connect GitHub
            </h1>
            <p className="body-sm text-[#737373]" style={{ fontWeight: 330 }}>
              Paste your Personal Access Token to get started.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3"
                role="alert"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
                  <p className="body-sm text-red-700" style={{ fontWeight: 340 }}>{error}</p>
                </div>
                <button onClick={clearError} className="p-1 rounded-full hover:bg-red-100 transition-colors" aria-label="Dismiss error">
                  <X className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border border-[#e5e5e5] rounded-3xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label htmlFor="github-token" className="caption text-[#737373] block mb-2">
                  Personal Access Token
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" aria-hidden="true" />
                  <input
                    id="github-token"
                    type={showToken ? 'text' : 'password'}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] text-black placeholder-[#b0b0b0] focus:outline-none focus:border-black transition-colors font-mono text-sm"
                    autoComplete="off"
                  />
                  <button type="button" onClick={() => setShowToken(!showToken)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] hover:text-black transition-colors"
                    aria-label={showToken ? 'Hide token' : 'Show token'}>
                    {showToken ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center gap-2">
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-hidden="true" /> Verifying…</>
                ) : (
                  <>Enter Dashboard <ChevronRight className="w-4 h-4" aria-hidden="true" /></>
                )}
              </button>

              <p className="text-center body-sm text-[#737373]" style={{ fontWeight: 330 }}>
                Don't have a token?{' '}
                <Link to="/docs" className="text-black font-medium hover:underline">
                  Follow the 5-min guide →
                </Link>
              </p>
            </form>

            <div className="border-t border-[#e5e5e5] bg-[#fafafa] p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-black shrink-0" aria-hidden="true" />
                <span className="eyebrow text-[#737373]">Security First</span>
              </div>
              <p className="body-sm text-[#737373]" style={{ fontWeight: 320 }}>
                Your token is stored only in your browser's localStorage. It is sent directly to GitHub's API - never to our servers.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['repo', 'read:user'].map(scope => (
                  <div key={scope} className="flex items-center gap-2 bg-white rounded-xl p-3 border border-[#e5e5e5]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" aria-hidden="true" />
                    <code className="eyebrow text-black">{scope}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center mt-6 body-sm text-[#737373]" style={{ fontWeight: 330 }}>
            <Link to="/" className="hover:text-black transition-colors" aria-label="Back to home page">← Back to home</Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}

export default Login;
