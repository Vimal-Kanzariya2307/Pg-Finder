import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, MessageSquare, Eye, Users, ArrowRight, CheckCircle, Clock, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { formatPrice, getStatusColor, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/pg/owner/my-listings'),
      api.get('/inquiries/received'),
    ]).then(([pgRes, inqRes]) => {
      setListings(pgRes.data.data || []);
      setInquiries(inqRes.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalViews = listings.reduce((sum, pg) => sum + (pg.views || 0), 0);
  const approved = listings.filter(p => p.status === 'approved').length;
  const pending = listings.filter(p => p.status === 'pending').length;
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
  const deletingTarget = deletingId === deleteTarget?.id;

  const openDeleteConfirm = (listingId, title) => {
    setDeleteTarget({ id: listingId, title });
  };

  const closeDeleteConfirm = () => {
    if (deletingId) return;
    setDeleteTarget(null);
  };

  const handleDeleteListing = async () => {
    if (!deleteTarget?.id) return;

    setDeletingId(deleteTarget.id);
    try {
      await api.delete(`/pg/${deleteTarget.id}`);
      setListings(prev => prev.filter(pg => pg._id !== deleteTarget.id));
      setInquiries(prev => prev.filter(inq => inq.pg?._id !== deleteTarget.id));
      toast.success('Listing deleted.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete the listing. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                {user?.name?.[0]}
              </div>
              <div>
                <p className="text-slate-400 text-sm">Owner workspace</p>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>{user?.name}</h1>
              </div>
            </div>
          </div>
          <Link to="/owner/add-pg" className="btn-primary">
            <Plus size={18} /> Create Listing
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: listings.length, icon: Building2, color: 'text-orange-400' },
            { label: 'Live Listings', value: approved, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Awaiting Review', value: pending, icon: Clock, color: 'text-yellow-400' },
            { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-blue-400' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="stat-card">
              <Icon size={18} className={`${color} mb-3`} />
              <div className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Clash Display' }}>{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Listings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>My Listings</h2>
              <Link to="/owner/add-pg" className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
                <Plus size={14} /> Create New
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <div key={i} className="card rounded-2xl p-5 shimmer-skeleton h-20" />)}
              </div>
            ) : listings.length === 0 ? (
              <div className="card rounded-2xl p-10 text-center">
                <Building2 size={40} className="mx-auto mb-3 text-slate-700" />
                <h3 className="text-white font-semibold mb-1">No Listings Yet</h3>
                <p className="text-slate-500 text-sm mb-4">Create your first listing to start receiving messages.</p>
                <Link to="/owner/add-pg" className="btn-primary text-sm py-2">
                  <Plus size={15} /> Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((pg, i) => {
                  return (
                    <motion.div key={pg._id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="card rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={pg.photos?.[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=60'}
                          alt={pg.title} className="w-full h-full object-cover"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=60'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-white font-medium text-sm truncate">{pg.title}</h4>
                          <span className={`badge text-xs ${getStatusColor(pg.status)}`}>{pg.status}</span>
                        </div>
                        <p className="text-slate-500 text-xs">{pg.address?.area}, {pg.address?.city}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span><Eye size={10} className="inline mr-1" />{pg.views}</span>
                          <span><Users size={10} className="inline mr-1" />{pg.availableRooms} available</span>
                          {pg.rent?.single && <span className="text-orange-400">{formatPrice(pg.rent.single)}/mo</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/owner/edit-pg/${pg._id}`}
                          className="text-xs text-slate-400 hover:text-orange-400 px-3 py-1.5 rounded-lg hover:bg-orange-500/10 transition-all">
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(pg._id, pg.title)}
                          disabled={deletingId === pg._id}
                          className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-60">
                          <span className="inline-flex items-center gap-1">
                            <Trash2 size={12} />
                            {deletingId === pg._id ? 'Deleting...' : 'Delete'}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Inquiries */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>
                Recent Messages {pendingInquiries > 0 && <span className="text-sm text-orange-400 font-normal">({pendingInquiries} new)</span>}
              </h2>
              <Link to="/owner/inquiries" className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
                All <ArrowRight size={14} />
              </Link>
            </div>

            {inquiries.slice(0, 5).length === 0 ? (
              <div className="card rounded-2xl p-8 text-center">
                <MessageSquare size={36} className="mx-auto mb-3 text-slate-700" />
                <p className="text-slate-500 text-sm">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.slice(0, 5).map((inq, i) => (
                  <motion.div key={inq._id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #f97316)' }}>
                        {inq.student?.name?.[0] || 'S'}
                      </div>
                      <span className="text-white text-sm font-medium">{inq.student?.name}</span>
                      <span className={`badge text-xs ml-auto ${getStatusColor(inq.status)}`}>{inq.status}</span>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-2 ml-9">{inq.message}</p>
                    <p className="text-slate-600 text-xs mt-1.5 ml-9">{formatDate(inq.createdAt)}</p>
                  </motion.div>
                ))}
                <Link to="/owner/inquiries" className="btn-secondary w-full text-sm py-2.5 text-center">
                  View All Messages
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2,6,23,0.78)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && closeDeleteConfirm()}>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: '#12121a', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertTriangle size={18} className="text-red-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display' }}>
                Delete listing?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Are you sure you want to remove <span className="text-white font-medium">"{deleteTarget.title}"</span>? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  disabled={deletingTarget}
                  className="btn-secondary text-sm py-2.5 px-4 disabled:opacity-60">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteListing}
                  disabled={deletingTarget}
                  className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 text-white transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                  <Trash2 size={14} />
                  {deletingTarget ? 'Deleting...' : 'Delete Listing'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
