import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Heart, Phone, Mail, Calendar, Users, Eye, ChevronLeft, ChevronRight, X, Send, User, Building2 } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { formatPrice, formatDate, amenityIcons, getPGImage } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function PGDetailPage() {
  const ZOOM_SCALE = 3.2;
  const LENS_SIZE = 170;

  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFavorite, toggleFavorite } = useAuthStore();
  const imageZoomRef = useRef(null);
  const [pg, setPG] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiry, setInquiry] = useState({ message: '', moveInDate: '', roomType: 'single' });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [review, setReview] = useState({ rating: 5, review: '' });
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    api.get(`/pg/${id}`).then(({ data }) => { setPG(data.data); setLoading(false); })
      .catch(() => { toast.error('This listing is no longer available.'); navigate('/search'); });
  }, [id]);

  useEffect(() => {
    setZoomActive(false);
  }, [activeImg]);

  const images = pg?.photos?.length > 0
    ? pg.photos.map(p => p.url)
    : Array(3).fill(null).map((_, i) => `https://images.unsplash.com/photo-155585487${7 + i}-bab0e564b8d5?w=800&q=80`);

  const handleInquiry = async (e) => {
    e.preventDefault();
    const role = (user?.role || '').toLowerCase();
    if (!user) { toast.error('Please sign in to continue.'); navigate('/login'); return; }
    if (role !== 'student') { toast.error('Please sign in with a student account to send a message.'); return; }
    setSendingInquiry(true);
    try {
      await api.post('/inquiries', { pgId: id, ...inquiry });
      toast.success('Message sent. The owner can now respond to you.');
      setShowInquiry(false);
      setInquiry({ message: '', moveInDate: '', roomType: 'single' });
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Please sign in with a student account to send a message.');
      } else {
        toast.error(err.response?.data?.message || 'Could not send your message. Please try again.');
      }
    } finally { setSendingInquiry(false); }
  };

  const openInquiryModal = () => {
    const role = (user?.role || '').toLowerCase();
    if (!user) {
      toast.error('Please sign in to continue.');
      navigate('/login');
      return;
    }
    if (role !== 'student') {
      toast.error('Please sign in with a student account to send a message.');
      return;
    }
    setShowInquiry(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to continue.'); navigate('/login'); return; }
    try {
      const { data } = await api.post(`/pg/${id}/review`, review);
      setPG(data.data);
      toast.success('Thanks for sharing your review.');
      setShowReview(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit your review. Please try again.');
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading listing details...</p>
      </div>
    </div>
  );

  if (!pg) return null;

  const favorited = isFavorite(pg._id);
  const minRent = Math.min(...[pg.rent?.single, pg.rent?.double, pg.rent?.triple].filter(Boolean));

  const updateZoomPosition = (clientX, clientY) => {
    const rect = imageZoomRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const handleZoomMouseMove = (e) => {
    updateZoomPosition(e.clientX, e.clientY);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-mesh">
      <div className="page-container">
        {/* Back nav */}
        <Link to="/search" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mt-6 mb-6 text-sm">
          <ChevronLeft size={16} /> Back to listings
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6 relative z-30">
            {/* Image Gallery */}
            <div className="relative z-40 isolate">
              <div
                ref={imageZoomRef}
                onMouseEnter={() => setZoomActive(true)}
                onMouseMove={handleZoomMouseMove}
                onMouseLeave={() => setZoomActive(false)}
                className={`relative rounded-2xl overflow-hidden ${zoomActive ? 'cursor-zoom-in' : 'cursor-default'}`}
                style={{ aspectRatio: '16/9' }}>
                <img src={images[activeImg] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'}
                  alt={pg.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {zoomActive && (
                  <div
                    className="pointer-events-none absolute z-20 rounded-xl border border-white/70 overflow-hidden"
                    style={{
                      width: `${LENS_SIZE}px`,
                      height: `${LENS_SIZE}px`,
                      left: `${zoomPosition.x}%`,
                      top: `${zoomPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 0 0 9999px rgba(2,6,23,0.35)',
                    }}>
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${images[activeImg] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: `${ZOOM_SCALE * 100}%`,
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all z-30">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all z-30">
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setActiveImg(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImg ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex gap-2 overflow-x-auto z-30">
                    {images.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === activeImg ? 'border-orange-500' : 'border-transparent opacity-60'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {zoomActive && (
                <div
                  className="hidden xl:block pointer-events-none absolute z-[80] top-0 left-full ml-4 w-80 rounded-2xl overflow-hidden border border-white/10"
                  style={{
                    height: '100%',
                    backgroundImage: `url(${images[activeImg] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${ZOOM_SCALE * 100}%`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              )}
            </div>

            {/* PG Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 rounded-2xl">
              <div className="flex flex-wrap items-start gap-3 justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="badge badge-orange">{pg.type}</span>
                    <span className={`badge ${pg.gender === 'Male' ? 'badge-blue' : pg.gender === 'Female' ? 'badge-orange' : 'badge-green'}`}>{pg.gender}</span>
                    {pg.status === 'approved' && <span className="badge badge-green">✓ Verified</span>}
                  </div>
                  <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>{pg.title}</h1>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
                    <MapPin size={13} className="text-orange-500" />
                    {pg.address?.street}, {pg.address?.area}, {pg.address?.city} - {pg.address?.pincode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Clash Display' }}>
                    {formatPrice(minRent)}
                  </div>
                  <div className="text-slate-500 text-xs">starting per month</div>
                  {pg.averageRating > 0 && (
                    <div className="flex items-center gap-1 mt-2 justify-end">
                      {[1,2,3,4,5].map(s => <Star key={s} size={13} className={s <= pg.averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} />)}
                      <span className="text-slate-400 text-xs ml-1">({pg.totalReviews})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-6 py-4 border-y border-white/5 mb-4 flex-wrap">
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-lg">{pg.totalRooms}</div>
                  <div className="text-slate-500 text-xs">Total Rooms</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">{pg.availableRooms}</div>
                  <div className="text-slate-500 text-xs">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-lg">{pg.views}</div>
                  <div className="text-slate-500 text-xs">Views</div>
                </div>
                {pg.deposit > 0 && (
                  <div className="text-center">
                    <div className="text-purple-400 font-bold text-lg">{formatPrice(pg.deposit)}</div>
                    <div className="text-slate-500 text-xs">Deposit</div>
                  </div>
                )}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">{pg.description}</p>
            </motion.div>

            {/* Pricing */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'single', label: 'Single Occupancy', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/20' },
                  { key: 'double', label: 'Double Occupancy', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20' },
                  { key: 'triple', label: 'Triple Occupancy', color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20' },
                ].map(({ key, label, color, border }) => pg.rent?.[key] ? (
                  <div key={key} className={`p-4 rounded-xl bg-gradient-to-br ${color} border ${border}`}>
                    <div className="text-xs text-slate-400 mb-1">{label}</div>
                    <div className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>{formatPrice(pg.rent[key])}</div>
                    <div className="text-xs text-slate-500">per month</div>
                  </div>
                ) : null)}
              </div>
            </motion.div>

            {/* Amenities */}
            {pg.amenities?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pg.amenities.map(amenity => (
                    <div key={amenity} className="amenity-chip justify-center text-sm py-2.5">
                      <span className="text-base">{amenityIcons[amenity]}</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Rules */}
            {pg.rules?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>House Rules</h2>
                <div className="space-y-2">
                  {pg.rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="text-orange-500 mt-0.5">•</span> {rule}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>
                  Reviews ({pg.totalReviews})
                </h2>
                {user?.role === 'student' && (
                  <button onClick={() => setShowReview(!showReview)} className="btn-secondary text-sm py-2">
                    Write Review
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showReview && (
                  <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleReview} className="mb-6 p-4 rounded-xl glass-orange space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">Rating:</span>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}>
                          <Star size={20} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
                        </button>
                      ))}
                    </div>
                    <textarea value={review.review} onChange={e => setReview(r => ({ ...r, review: e.target.value }))}
                      placeholder="Share your experience..." rows={3} className="input-field resize-none" required />
                    <button type="submit" className="btn-primary text-sm py-2">Submit Review</button>
                  </motion.form>
                )}
              </AnimatePresence>

              {pg.ratings?.length === 0 ? (
                <p className="text-slate-500 text-sm">No reviews yet. You can be the first to share one.</p>
              ) : (
                <div className="space-y-4">
                  {pg.ratings?.map((r, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                        {r.user?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium">{r.user?.name || 'Anonymous'}</span>
                          <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} />)}</div>
                        </div>
                        {r.review && <p className="text-slate-400 text-sm">{r.review}</p>}
                        <p className="text-slate-600 text-xs mt-1">{formatDate(r.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Owner card + inquiry */}
          <div className="space-y-4 relative z-10">
            {/* Sticky owner card */}
            <div className="sticky top-24 space-y-4">
              {/* Owner info */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 rounded-2xl">
                <h3 className="font-semibold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Listed by</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                    {pg.owner?.name?.[0] || 'O'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{pg.owner?.name}</p>
                    <p className="text-slate-500 text-xs">Property owner</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {pg.owner?.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Phone size={13} className="text-orange-500" />
                      {user ? pg.owner.phone : '••••••••••'}
                    </div>
                  )}
                  {pg.owner?.email && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Mail size={13} className="text-orange-500" />
                      {user ? pg.owner.email : '••••••••••'}
                    </div>
                  )}
                </div>

                {!user && (
                  <p className="text-xs text-slate-500 mb-4 p-3 rounded-xl glass-orange">
                    Sign in to view contact details
                  </p>
                )}

                <div className="space-y-2">
                  <button onClick={openInquiryModal}
                    className="btn-primary w-full">
                    <Send size={16} /> Message Owner
                  </button>
                  {user && (
                    <button onClick={() => toggleFavorite(pg._id)}
                      className={`btn-secondary w-full ${favorited ? 'border-red-500/30 text-red-400' : ''}`}>
                      <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
                      {favorited ? 'Saved Listing' : 'Save Listing'}
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="card p-5 rounded-2xl">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <Calendar size={14} className="text-orange-500 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">Available from</div>
                    <div className="text-white text-xs font-medium mt-0.5">{formatDate(pg.availableFrom)}</div>
                  </div>
                  <div>
                    <Building2 size={14} className="text-orange-500 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">Listed on</div>
                    <div className="text-white text-xs font-medium mt-0.5">{formatDate(pg.createdAt)}</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showInquiry && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
            onClick={e => e.target === e.currentTarget && setShowInquiry(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: '#12121a', border: '1px solid rgba(249,115,22,0.2)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>Message Owner</h3>
                <button onClick={() => setShowInquiry(false)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Room Type</label>
                  <select value={inquiry.roomType} onChange={e => setInquiry(i => ({ ...i, roomType: e.target.value }))}
                    className="select-field">
                    {pg.rent?.single && <option value="single">Single - {formatPrice(pg.rent.single)}/mo</option>}
                    {pg.rent?.double && <option value="double">Double - {formatPrice(pg.rent.double)}/mo</option>}
                    {pg.rent?.triple && <option value="triple">Triple - {formatPrice(pg.rent.triple)}/mo</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Preferred Move-in Date</label>
                  <input type="date" value={inquiry.moveInDate} onChange={e => setInquiry(i => ({ ...i, moveInDate: e.target.value }))}
                    className="input-field" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Message to Owner</label>
                  <textarea value={inquiry.message} onChange={e => setInquiry(i => ({ ...i, message: e.target.value }))}
                    placeholder="Hi, I am interested in this listing. Could you share more details?"
                    rows={4} className="input-field resize-none" required />
                </div>
                <button type="submit" disabled={sendingInquiry} className="btn-primary w-full">
                  {sendingInquiry ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending message...</>
                  ) : (
                    <><Send size={16} /> Send Message</>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
