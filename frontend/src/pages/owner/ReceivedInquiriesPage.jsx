import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Phone, Mail, Send, ChevronDown, ChevronUp, MapPin, Calendar } from 'lucide-react';
import api from '../../utils/api';
import { formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ReceivedInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    api.get('/inquiries/received')
      .then(({ data }) => { setInquiries(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleRespond = async (inqId) => {
    if (!response.trim()) return;
    setResponding(inqId);
    try {
      const { data } = await api.put(`/inquiries/${inqId}/respond`, { ownerResponse: response });
      setInquiries(prev => prev.map(i => i._id === inqId ? { ...i, ownerResponse: data.data.ownerResponse, status: 'responded' } : i));
      setResponse('');
      setExpanded(null);
      toast.success('Reply sent successfully.');
    } catch (err) {
      toast.error('Could not send your reply. Please try again.');
    } finally { setResponding(null); }
  };

  const pendingCount = inquiries.filter(i => i.status === 'pending').length;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <MessageSquare size={18} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>
                Student Messages
                {pendingCount > 0 && (
                  <span className="ml-2 text-base font-normal text-orange-400">({pendingCount} new)</span>
                )}
              </h1>
            </div>
          </div>
          <p className="text-slate-400">{inquiries.length} total message{inquiries.length !== 1 ? 's' : ''} received</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => <div key={i} className="card rounded-2xl p-6 shimmer-skeleton h-24" />)}
          </div>
        ) : inquiries.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <MessageSquare size={56} className="mx-auto mb-4 text-slate-700" />
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display' }}>No Messages Yet</h3>
            <p className="text-slate-400">Student messages will appear here once your listings are visible.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq, i) => (
              <motion.div key={inq._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }} className="card rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === inq._id ? null : inq._id)}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #f97316)' }}>
                      {inq.student?.name?.[0] || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-white font-semibold">{inq.student?.name}</span>
                        <span className={`badge text-xs ${getStatusColor(inq.status)}`}>{inq.status}</span>
                        <span className="badge badge-blue capitalize">{inq.roomType} room</span>
                      </div>
                      <p className="text-slate-500 text-xs mb-1">{inq.pg?.title}</p>
                      <p className="text-slate-400 text-sm line-clamp-1">{inq.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                        <span><Calendar size={10} className="inline mr-1" />{formatDate(inq.createdAt)}</span>
                        {inq.moveInDate && <span>Preferred move-in: {formatDate(inq.moveInDate)}</span>}
                      </div>
                    </div>
                    <div className="text-slate-500 flex-shrink-0">
                      {expanded === inq._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {expanded === inq._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="border-t border-white/5 px-5 pb-5">
                      <div className="pt-4 space-y-4">
                        {/* Student contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {inq.student?.phone && (
                            <a href={`tel:${inq.student.phone}`}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <Phone size={14} className="text-green-400" /> {inq.student.phone}
                            </a>
                          )}
                          {inq.student?.email && (
                            <a href={`mailto:${inq.student.email}`}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <Mail size={14} className="text-blue-400" /> {inq.student.email}
                            </a>
                          )}
                        </div>

                        {/* Full message */}
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Message</p>
                          <p className="text-slate-300 text-sm p-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {inq.message}
                          </p>
                        </div>

                        {/* Existing response */}
                        {inq.ownerResponse && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Your Response</p>
                            <p className="text-slate-300 text-sm p-3 rounded-xl"
                              style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
                              {inq.ownerResponse}
                            </p>
                          </div>
                        )}

                        {/* Respond form */}
                        {inq.status !== 'responded' && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                              {inq.ownerResponse ? 'Update Reply' : 'Send Reply'}
                            </p>
                            <textarea value={response} onChange={e => setResponse(e.target.value)}
                              placeholder="Write a clear and helpful reply for the student..."
                              rows={3} className="input-field resize-none text-sm mb-2" />
                            <button onClick={() => handleRespond(inq._id)}
                              disabled={!response.trim() || responding === inq._id}
                              className="btn-primary text-sm py-2.5 disabled:opacity-50">
                              {responding === inq._id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : <Send size={14} />}
                              Send Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
