import { Link } from 'react-router-dom';
import { Building2, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                <Building2 size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                PG<span className="gradient-text">Finder</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              Find trusted PG stays near your college or workplace, without the usual stress.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl flex items-center justify-center glass hover:border-orange-500/30 transition-all duration-300 hover:text-orange-400 text-slate-400">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">Quick Links</h4>
            <div className="space-y-2.5">
              {[
                { to: '/search', label: 'Browse Listings' },
                { to: '/register', label: 'List a Property' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="block text-sm text-slate-400 hover:text-orange-400 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">Support</h4>
            <div className="space-y-3">
              {[
                { icon: Mail, text: 'support@pgfinder.in' },
                { icon: Phone, text: '+91 98765 43210' },
                { icon: MapPin, text: 'Bangalore, India' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Icon size={14} className="text-orange-500 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© 2026 PGFinder. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
