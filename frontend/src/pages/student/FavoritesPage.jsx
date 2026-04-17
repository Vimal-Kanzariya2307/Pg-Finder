import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import PGCard from '../../components/pg/PGCard';
import SkeletonCard from '../../components/ui/SkeletonCard';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/favorites')
      .then(({ data }) => { setFavorites(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.2)' }}>
              <Heart size={18} className="text-pink-400" />
            </div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>Saved Listings</h1>
          </div>
          <p className="text-slate-400 ml-1">{loading ? 'Loading your saved listings...' : `${favorites.length} listing${favorites.length !== 1 ? 's' : ''} saved`}</p>
        </motion.div>

        {loading ? (
          <div className="pg-grid">{Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : favorites.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24">
            <Heart size={56} className="mx-auto mb-4 text-slate-700" />
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display' }}>No Saved Listings Yet</h3>
            <p className="text-slate-400 mb-6">Browse listings and save the ones you want to compare later.</p>
            <Link to="/search" className="btn-primary inline-flex">
              <Search size={16} /> Browse Listings
            </Link>
          </motion.div>
        ) : (
          <div className="pg-grid">
            {favorites.map((pg, i) => <PGCard key={pg._id} pg={pg} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
