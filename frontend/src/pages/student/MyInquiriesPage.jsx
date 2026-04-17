import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import { formatDate, formatPrice, getStatusColor } from '../../utils/helpers';

export default function MyInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/inquiries/my')
      .then(({ data }) => { setInquiries(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <MessageSquare size={18} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>My Messages</h1>
          </div>
          <p className="text-slate-400">{loading ? 'Loading messages...' : `${inquiries.length} message${inquiries.length !== 1 ? 's' : ''} sent`}</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card rounded-2xl p-6">
                <div className="shimmer-skeleton h-5 w-1/2 rounded mb-3" />
                <div className="shimmer-skeleton h-4 w-1/3 rounded mb-2" />
                <div className="shimmer-skeleton h-12 w-full rounded" />
              </div>
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <MessageSquare size={56} className="mx-auto mb-4 text-slate-700" />
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display' }}>No Messages Yet</h3>
            <p className="text-slate-400">Send your first message from any listing to get started.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq, i) => (
              <motion.div key={inq._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} className="card rounded-2xl overflow-hidden">
                <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === inq._id ? null : inq._id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold" style={{ fontFamily: 'Clash Display' }}>
                          {inq.pg?.title || 'PG Listing'}
                        </h3>
                        <span className={`badge ${getStatusColor(inq.status)}`}>{inq.status}</span>
                      </div>
                      {inq.pg?.address && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-2">
                          <MapPin size={10} className="text-orange-500" />
                          {inq.pg.address.area}, {inq.pg.address.city}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {formatDate(inq.createdAt)}
                        </span>
                        <span className="capitalize badge badge-blue">{inq.roomType} room</span>
                        {inq.moveInDate && <span>Preferred move-in: {formatDate(inq.moveInDate)}</span>}
                      </div>
                    </div>
                    <div className="text-slate-500">
                      {expanded === inq._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {expanded === inq._id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
                    className="border-t border-white/5 px-5 pb-5">
                    <div className="pt-4 space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Message You Sent</p>
                        <p className="text-slate-300 text-sm p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {inq.message}
                        </p>
                      </div>

                      {inq.ownerResponse && (
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Owner Reply</p>
                          <p className="text-slate-300 text-sm p-3 rounded-xl"
                            style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
                            {inq.ownerResponse}
                          </p>
                          {inq.owner && (
                            <div className="mt-2 text-xs text-slate-500">
                              Phone: {inq.owner.phone || 'Not shared'} &nbsp;|&nbsp; Email: {inq.owner.email || 'Not shared'}
                            </div>
                          )}
                        </div>
                      )}

                      {inq.status === 'pending' && (
                        <p className="text-xs text-orange-400/70 flex items-center gap-1.5">
                          <span className="glow-dot w-1.5 h-1.5" /> Waiting for the owner to reply...
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
