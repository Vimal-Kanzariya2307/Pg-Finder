import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Check, X, Star, Eye, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate, formatPrice, getMinRent, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminPGsPage() {
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchPGs = async (status = '') => {
    setLoading(true);
    try {
      const params = status ? `?status=${status}&limit=50` : '?limit=50';
      const { data } = await api.get(`/admin/pgs${params}`);
      setPGs(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Could not load listings. Please refresh.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPGs(statusFilter); }, [statusFilter]);

  const updateStatus = async (id, status, isFeatured) => {
    try {
      await api.put(`/admin/pgs/${id}/status`, { status, isFeatured });
      setPGs(prev => prev.map(p => p._id === id ? { ...p, status, ...(isFeatured !== undefined ? { isFeatured } : {}) } : p));
      toast.success(`Listing marked as ${status}.`);
    } catch (err) {
      toast.error('Could not update listing status.');
    }
  };

  const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>
              <Building2 size={26} className="inline text-orange-500 mr-2" />Listing Moderation
            </h1>
            <p className="text-slate-400 mt-1">{total} total PG listings</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-500" />
            {STATUS_OPTIONS.map(({ value, label }) => (
              <button key={value} onClick={() => setStatusFilter(value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${statusFilter === value ? 'btn-primary py-2' : 'btn-secondary py-2'}`}>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {Array(8).fill(0).map((_, i) => <div key={i} className="card rounded-2xl p-5 shimmer-skeleton h-20" />)}
          </div>
        ) : pgs.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto mb-4 text-slate-700" />
            <h3 className="text-xl font-bold text-white mb-2">No listings found</h3>
            <p className="text-slate-400">No listings match the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pgs.map((pg, i) => (
              <motion.div key={pg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="card rounded-2xl p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Image */}
                  <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={pg.photos?.[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=60'}
                      alt="" className="w-full h-full object-cover"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=60'} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <Link to={`/pg/${pg._id}`} className="text-white font-semibold hover:text-orange-400 transition-colors truncate">
                        {pg.title}
                      </Link>
                      <span className={`badge text-xs ${getStatusColor(pg.status)}`}>{pg.status}</span>
                      {pg.isFeatured && <span className="badge badge-orange text-xs">⭐ Featured</span>}
                    </div>
                    <p className="text-slate-500 text-xs">{pg.address?.area}, {pg.address?.city} • Owner: {pg.owner?.name || 'Unknown'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                      <span><Eye size={10} className="inline mr-1" />{pg.views} views</span>
                      {getMinRent(pg) && <span className="text-orange-400">{formatPrice(getMinRent(pg))}/mo</span>}
                      <span>{formatDate(pg.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {pg.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(pg._id, 'approved')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:bg-green-500/15 transition-all"
                          style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
                          <Check size={13} /> Approve
                        </button>
                        <button onClick={() => updateStatus(pg._id, 'rejected')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/15 transition-all"
                          style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                          <X size={13} /> Decline
                        </button>
                      </>
                    )}
                    {pg.status === 'approved' && (
                      <>
                        <button onClick={() => updateStatus(pg._id, 'approved', !pg.isFeatured)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${pg.isFeatured ? 'text-yellow-400 bg-yellow-500/10' : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10'}`}
                          style={{ border: '1px solid rgba(234,179,8,0.2)' }}>
                          <Star size={13} fill={pg.isFeatured ? 'currentColor' : 'none'} />
                          {pg.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button onClick={() => updateStatus(pg._id, 'rejected')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/15 transition-all"
                          style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                          <X size={13} /> Move to Rejected
                        </button>
                      </>
                    )}
                    {pg.status === 'rejected' && (
                      <button onClick={() => updateStatus(pg._id, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:bg-green-500/15 transition-all"
                        style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
                        <Check size={13} /> Re-Approve
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
