import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, MessageSquare, LogOut, Menu, X, User, Building2, Shield, ChevronDown, Plus } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} onClick={onClick}
      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg group ${active ? 'text-orange-400' : 'text-slate-400 hover:text-white'}`}>
      {children}
      {active && (
        <motion.div layoutId="nav-indicator"
          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #f97316, #ec4899)' }} />
      )}
    </Link>
  );
};

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => { logout(); setDropdownOpen(false); navigate('/'); };

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === 'student') return [
      { to: '/student', label: 'Dashboard', icon: Home },
      { to: '/search', label: 'Find PG', icon: Search },
      { to: '/student/favorites', label: 'Favorites', icon: Heart },
      { to: '/student/inquiries', label: 'My Inquiries', icon: MessageSquare },
    ];
    if (user.role === 'owner') return [
      { to: '/owner', label: 'Dashboard', icon: Building2 },
      { to: '/owner/add-pg', label: 'New Listing', icon: Plus },
      { to: '/owner/inquiries', label: 'Inquiries', icon: MessageSquare },
    ];
    if (user.role === 'admin') return [
      { to: '/admin', label: 'Dashboard', icon: Shield },
      { to: '/admin/pgs', label: 'Listings', icon: Building2 },
      { to: '/admin/users', label: 'Users', icon: User },
    ];
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className={`mx-4 sm:mx-8 rounded-2xl transition-all duration-500 ${scrolled ? 'glass shadow-2xl' : 'bg-transparent'}`}>
        <div className="page-container">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  <Building2 size={18} className="text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', filter: 'blur(8px)', zIndex: -1 }} />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                PG<span className="gradient-text">Finder</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {!user && (
                <>
                  <NavLink to="/">Home</NavLink>
                  <NavLink to="/search">Find PG</NavLink>
                </>
              )}
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Join Free</Link>
                </>
              ) : (
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white leading-tight">{user.name?.split(' ')[0]}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl"
                        style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="p-3">
                          <p className="text-xs text-slate-500 px-3 py-1 font-medium">{user.email}</p>
                        </div>
                        <div className="border-t border-white/5 p-2">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mx-4 mt-2 rounded-2xl overflow-hidden"
            style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-4 space-y-1">
              {!user && (
                <>
                  <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <Home size={16} /> Home
                  </Link>
                  <Link to="/search" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <Search size={16} /> Find PG
                  </Link>
                </>
              )}
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <Icon size={16} /> {link.label}
                  </Link>
                );
              })}
              {!user ? (
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm py-2.5">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm py-2.5">Join Free</Link>
                </div>
              ) : (
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-2">
                  <LogOut size={16} /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
