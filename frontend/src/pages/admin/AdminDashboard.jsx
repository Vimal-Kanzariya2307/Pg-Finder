import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, MessageSquare, Clock, CheckCircle, TrendingUp, ArrowRight, Shield } from 'lucide-react';
import api from '../../utils/api';
import { formatDate, getStatusColor } from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingPGs, setPendingPGs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/pgs?status=pending&limit=5'),
    ]).then(([statsRes, pgsRes]) => {
      setStats(statsRes.data.stats);
      setPendingPGs(pgsRes.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total PGs', value: stats.totalPGs, icon: Building2, color: 'text-orange-400', bg: 'from-orange-500/15 to-orange-600/5' },
    { label: 'Pending Review', value: stats.pendingPGs, icon: Clock, color: 'text-yellow-400', bg: 'from-yellow-500/15 to-yellow-600/5' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'from-blue-500/15 to-blue-600/5' },
    { label: 'Inquiries', value: stats.totalInquiries, icon: MessageSquare, color: 'text-purple-400', bg: 'from-purple-500/15 to-purple-600/5' },
    { label: 'Students', value: stats.students, icon: TrendingUp, color: 'text-green-400', bg: 'from-green-500/15 to-green-600/5' },
    { label: 'Owners', value: stats.owners, icon: Shield, color: 'text-indigo-400', bg: 'from-indigo-500/15 to-indigo-600/5' },
  ] : [];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #f97316)' }}>
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Admin panel</p>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>Platform Overview</h1>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Array(6).fill(0).map((_, i) => <div key={i} className="stat-card shimmer-skeleton h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${bg}`}
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <Icon size={20} className={`${color} mb-3`} />
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Clash Display' }}>{value}</div>
                <div className="text-slate-400 text-sm">{label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending PGs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>
                Pending Approval
                {stats?.pendingPGs > 0 && <span className="ml-2 text-sm text-yellow-400 font-normal">({stats.pendingPGs})</span>}
              </h2>
              <Link to="/admin/pgs?status=pending" className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {pendingPGs.length === 0 ? (
              <div className="card rounded-2xl p-10 text-center">
                <CheckCircle size={36} className="mx-auto mb-3 text-green-500/50" />
                <p className="text-slate-400">Everything is up to date. No pending listings right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPGs.map((pg, i) => (
                  <motion.div key={pg._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }} className="card rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={pg.photos?.[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=60'}
                          alt="" className="w-full h-full object-cover"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=60'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{pg.title}</p>
                        <p className="text-slate-500 text-xs">{pg.address?.city} • {pg.owner?.name}</p>
                        <p className="text-slate-600 text-xs">{formatDate(pg.createdAt)}</p>
                      </div>
                      <Link to={`/admin/pgs`}
                        className="text-xs text-orange-400 hover:text-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-500/10 transition-all flex-shrink-0">
                        Review
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick nav */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Quick Actions</h2>
            <div className="space-y-3">
              {[
                { to: '/admin/pgs', icon: Building2, label: 'Review Listings', desc: 'Approve, reject, or feature listings', color: 'from-orange-500/15 to-orange-600/5', border: 'border-orange-500/20' },
                { to: '/admin/users', icon: Users, label: 'Manage Users', desc: 'Check account status and roles', color: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/20' },
              ].map(({ to, icon: Icon, label, desc, color, border }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:scale-[1.01] transition-all duration-200 group`}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{label}</p>
                    <p className="text-slate-400 text-sm">{desc}</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
