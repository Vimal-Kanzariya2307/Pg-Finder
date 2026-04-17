import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Search, GraduationCap, Building2, Shield } from 'lucide-react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => { setUsers(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.data.isActive } : u));
      toast.success(data.data.isActive ? 'User account activated.' : 'User account deactivated.');
    } catch {
      toast.error('Could not update user status.');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleIcons = { student: GraduationCap, owner: Building2, admin: Shield };
  const roleColors = { student: 'text-blue-400', owner: 'text-orange-400', admin: 'text-purple-400' };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Clash Display' }}>
            <Users size={26} className="inline text-orange-500 mr-2" />User Management
          </h1>
          <p className="text-slate-400">{users.length} total registered users</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users by name or email..." className="input-field pl-10 text-sm" />
          </div>
          <div className="flex gap-2">
            {[{ value: '', label: 'All' }, { value: 'student', label: 'Students' }, { value: 'owner', label: 'Owners' }, { value: 'admin', label: 'Admins' }]
              .map(({ value, label }) => (
                <button key={value} onClick={() => setRoleFilter(value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${roleFilter === value ? 'btn-primary py-2.5' : 'btn-secondary py-2.5'}`}>
                  {label}
                </button>
              ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(8).fill(0).map((_, i) => <div key={i} className="card rounded-2xl p-4 shimmer-skeleton h-16" />)}
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-3">Showing {filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
            <div className="space-y-2">
              {filtered.map((user, i) => {
                const RoleIcon = roleIcons[user.role] || Users;
                return (
                  <motion.div key={user._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }} className="card rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium text-sm">{user.name}</span>
                          <div className="flex items-center gap-1">
                            <RoleIcon size={11} className={roleColors[user.role]} />
                            <span className={`text-xs capitalize ${roleColors[user.role]}`}>{user.role}</span>
                          </div>
                          {!user.isActive && <span className="badge badge-red text-xs">Inactive</span>}
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">{user.email} {user.phone && `• ${user.phone}`}</p>
                        <p className="text-slate-600 text-xs">Joined {formatDate(user.createdAt)}</p>
                      </div>
                      {user.role !== 'admin' && (
                        <button onClick={() => toggleUser(user._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                            user.isActive
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-green-400 hover:bg-green-500/10'
                          }`}
                          style={{ border: `1px solid ${user.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}` }}>
                          {user.isActive ? <><UserX size={12} /> Disable</> : <><UserCheck size={12} /> Enable</>}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
