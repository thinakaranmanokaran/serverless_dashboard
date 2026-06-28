import { Link } from 'react-router-dom';
import { Github, Twitter, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#e5e5e5] mt-24">
      {/* Dense link grid */}
      <div className="max-w-[1280px] mx-auto px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Wordmark column */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6">
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 28, letterSpacing: '-0.5px', lineHeight: 1 }} className="text-black block mb-2">
                Serverless Dashboard
              </span>
              <span className="caption text-[#737373] mt-1 block">Zero-infrastructure config.</span>
            </div>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-black hover:text-white transition-all text-black" aria-label="GitHub">
                <Github className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-black hover:text-white transition-all text-black" aria-label="Twitter">
                <Twitter className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="caption text-[#737373] mb-4">Product</p>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/docs', label: 'Documentation' },
                { to: '/dashboard', label: 'Dashboard' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="body-sm text-[#737373] hover:text-black transition-colors" style={{ fontWeight: 330, fontSize: 14 }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="caption text-[#737373] mb-4">Resources</p>
            <ul className="space-y-3">
              {[
                { href: 'https://github.com/settings/tokens', label: 'GitHub Tokens', external: true },
                { href: 'https://docs.github.com', label: 'GitHub Docs', external: true },
                { href: 'https://github.com', label: 'Open Source', external: true },
              ].map(({ href, label, external }) => (
                <li key={href}>
                  <a href={href} target={external ? "_blank" : undefined} rel="noopener noreferrer"
                    className="body-sm text-[#737373] hover:text-black transition-colors flex items-center gap-1" style={{ fontWeight: 330, fontSize: 14 }}>
                    {label} {external && <ExternalLink className="w-3 h-3 opacity-40" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="caption text-[#737373] mb-4">Legal</p>
            <ul className="space-y-3">
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="body-sm text-[#737373] hover:text-black transition-colors" style={{ fontWeight: 330, fontSize: 14 }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#e5e5e5] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="caption text-[#737373]">© 2026 Serverless Dashboard</p>
          <p className="caption text-[#737373]">
            Developed by{' '}
            <a href="https://thinakaran.dev/" target="_blank" rel="noopener noreferrer" className="text-black hover:underline font-medium">
              Thinakaran Manokaran
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
