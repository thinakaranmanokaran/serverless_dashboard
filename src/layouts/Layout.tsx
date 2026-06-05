import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useGitHub } from '../hooks/useGitHub';
import { Github, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGOS = ['GitHub', 'Vercel', 'Netlify', 'Stripe', 'Linear', 'Notion', 'Railway', 'Supabase'];

export function Layout() {
  const { token, user, logout } = useGitHub();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Top Nav ─────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5] h-14 flex items-center">
        <div className="max-w-[1280px] mx-auto w-full px-6 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="RemoteConfig" className="w-5 h-5 object-contain invert" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="color:white;font-size:10px;font-weight:700">RC</span>';
              }} />
            </div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 540, fontSize: 15, letterSpacing: '-0.3px' }} className="text-black">
              RemoteConfig<span className="opacity-40">.io</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {[
              { href: '/', label: 'Home' },
              { href: '/docs', label: 'Docs' },
              ...(token ? [
                { href: '/dashboard', label: 'Workspaces' },
                { href: '/editor', label: 'Editor' },
              ] : []),
            ].map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive(href)
                    ? 'bg-black text-white font-medium'
                    : 'text-[#737373] hover:text-black hover:bg-[#f5f5f5]'
                }`}
                style={{ fontWeight: isActive(href) ? 480 : 330, fontFamily: 'DM Sans, sans-serif' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {token ? (
              <div className="flex items-center gap-3">
                {user?.avatar_url && (
                  <img src={user.avatar_url} alt={user.login} className="w-7 h-7 rounded-full border border-[#e5e5e5]" />
                )}
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-[#737373] hover:text-black hover:bg-[#f5f5f5] transition-colors" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 330 }}>
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm !py-2 !px-4 border border-[#e5e5e5]" style={{ fontSize: 14 }}>
                  Sign in
                </Link>
                <Link to="/login" className="btn-primary text-sm !py-2 !px-4" style={{ fontSize: 14 }}>
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-full hover:bg-[#f5f5f5] transition-colors" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Marquee strip ───────────────────────── */}
      <div className="bg-black text-white overflow-hidden h-9 flex items-center" aria-hidden="true">
        <div className="animate-marquee">
          {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
            <span key={i} className="caption px-8 opacity-60 shrink-0">{logo}</span>
          ))}
        </div>
      </div>

      {/* ── Mobile overlay ──────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            <div className="h-14 px-6 flex items-center justify-between border-b border-[#e5e5e5]">
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 540, fontSize: 15 }}>RemoteConfig.io</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-[#f5f5f5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-6 space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/docs', label: 'Documentation' },
                ...(token ? [
                  { href: '/dashboard', label: 'Workspaces' },
                  { href: '/editor', label: 'Editor' },
                ] : []),
              ].map(({ href, label }) => (
                <Link key={href} to={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#f5f5f5] transition-colors"
                  style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 340, fontSize: 20 }}>
                  {label} <ChevronRight className="w-4 h-4 opacity-30" />
                </Link>
              ))}
            </nav>
            <div className="p-6 border-t border-[#e5e5e5] flex flex-col gap-3">
              {token ? (
                <button onClick={handleLogout} className="btn-secondary w-full border border-[#e5e5e5]">Sign out</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full border border-[#e5e5e5] text-center">Sign in</Link>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center">Get started free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page content ────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
