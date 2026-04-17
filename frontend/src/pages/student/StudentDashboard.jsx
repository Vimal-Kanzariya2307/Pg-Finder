import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, MessageSquare, Star, TrendingUp, ArrowRight, Building2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ favorites: 0, inquiries: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/users/favorites'),
      api.get('/inquiries/my'),
    ]).then(([favRes, inqRes]) => {
      setStats({ favorites: favRes.data.data?.length || 0, inquiries: inqRes.data.data?.length || 0 });
    }).catch(() => {});
  }, []);

  const quickActions = [
    { to: '/search', icon: Search, label: 'Find PGs', desc: 'Browse listings that fit your needs', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/20' },
    { to: '/student/favorites', icon: Heart, label: 'Saved Listings', desc: `${stats.favorites} listing${stats.favorites !== 1 ? 's' : ''} saved`, color: 'from-pink-500/20 to-pink-600/10', border: 'border-pink-500/20' },
    { to: '/student/inquiries', icon: MessageSquare, label: 'My Messages', desc: `${stats.inquiries} message${stats.inquiries !== 1 ? 's' : ''} sent`, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container">
        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
              {user?.name?.[0]}
            </div>
            <div>
              <p className="text-slate-400 text-sm">Welcome back,</p>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>
                {user?.name?.split(' ')[0]}
              </h1>
            </div>
          </div>
          <p className="text-slate-400 ml-1">Everything you need to find and track your next stay.</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Saved PGs', value: stats.favorites, icon: Heart, color: 'text-pink-400' },
            { label: 'Messages Sent', value: stats.inquiries, icon: MessageSquare, color: 'text-blue-400' },
            { label: 'Listings Viewed', value: '--', icon: TrendingUp, color: 'text-green-400' },
            { label: 'Average Rating', value: '4.8★', icon: Star, color: 'text-yellow-400' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="stat-card">
              <Icon size={18} className={`${color} mb-3`} />
              <div className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Clash Display' }}>{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <h2 className="text-xl font-bold text-white mb-5" style={{ fontFamily: 'Clash Display' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {quickActions.map(({ to, icon: Icon, label, desc, color, border }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }}>
              <Link to={to} className={`block p-6 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:scale-[1.02] transition-all duration-300 group`}>
                <Icon size={24} className="text-white mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-white font-semibold mb-1" style={{ fontFamily: 'Clash Display' }}>{label}</div>
                <div className="text-slate-400 text-sm">{desc}</div>
                <ArrowRight size={16} className="text-slate-400 mt-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent searches CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(99,102,241,0.05))', border: '1px solid rgba(249,115,22,0.15)' }}>
          <Building2 size={40} className="text-orange-500/50 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display' }}>Ready to move in?</h3>
          <p className="text-slate-400 mb-4 text-sm">Discover verified options and message owners directly.</p>
          <Link to="/search" className="btn-primary inline-flex">
            <Search size={16} /> Start Browsing
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
