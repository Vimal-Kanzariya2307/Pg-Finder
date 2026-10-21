import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal, Building2, ChevronDown } from 'lucide-react';
import PGCard from '../components/pg/PGCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import api from '../utils/api';
import { AMENITIES_LIST } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest listings' },
  { value: 'rent.single', label: 'Price: low to high' },
  { value: '-rent.single', label: 'Price: high to low' },
  { value: '-averageRating', label: 'Top rated' },
  { value: '-views', label: 'Most viewed' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || searchParams.get('city') || '',
    gender: searchParams.get('gender') || '',
    type: searchParams.get('type') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    amenities: [],
    sort: '-createdAt',
  });

  const fetchPGs = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.gender) params.set('gender', filters.gender);
      if (filters.type) params.set('type', filters.type);
      if (filters.minRent) params.set('minRent', filters.minRent);
      if (filters.maxRent) params.set('maxRent', filters.maxRent);
      if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
      params.set('sort', filters.sort);
      params.set('page', pageNum);
      params.set('limit', 12);

      const { data } = await api.get(`/pg?${params}`);
      setPGs(data.data || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchPGs(1); }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => setFilters({ search: '', gender: '', type: '', minRent: '', maxRent: '', amenities: [], sort: '-createdAt' });

  const activeFilterCount = [filters.gender, filters.type, filters.minRent, filters.maxRent].filter(Boolean).length + filters.amenities.length;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display' }}>
            Find Your Next <span className="gradient-text">PG</span>
          </motion.h1>
          <p className="text-slate-400">{loading ? 'Looking for matches...' : `${total} listings found`}</p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              placeholder="Search by city, area, or listing name..."
              className="input-field pl-10 pr-4"
            />
          </div>
          <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)}
            className="select-field sm:w-52">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${showFilters ? 'btn-primary' : 'btn-secondary'}`}>
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-orange-600 text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6">
              <div className="card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-white" style={{ fontFamily: 'Clash Display' }}>
                    <Filter size={16} className="inline mr-2 text-orange-500" /> Refine results
                  </h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                      <X size={12} /> Reset all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Gender</label>
                    <select value={filters.gender} onChange={e => handleFilterChange('gender', e.target.value)} className="select-field text-sm bg-[#171721] text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 hover:border-orange-500/50 transition-all duration-200 [&>option]:bg-[#171721] [&>option]:text-white">
                      <option value="">Any</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Co-ed">Co-ed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Type</label>
                    <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} className="select-field text-sm">
                      <option value="">All Types</option>
                      <option value="PG">PG</option>
                      <option value="Hostel">Hostel</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Min Rent</label>
                    <input type="number" value={filters.minRent} onChange={e => handleFilterChange('minRent', e.target.value)}
                      placeholder="₹ 0" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Max Rent</label>
                    <input type="number" value={filters.maxRent} onChange={e => handleFilterChange('maxRent', e.target.value)}
                      placeholder="₹ 50,000" className="input-field text-sm" />
                  </div>
                </div>
                <div className="mt-5">
                  <label className="block text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_LIST.map(amenity => (
                      <button key={amenity} onClick={() => toggleAmenity(amenity)}
                        className={`amenity-chip cursor-pointer transition-all duration-200 ${filters.amenities.includes(amenity) ? 'border-orange-500/40 text-orange-400 bg-orange-500/10' : 'hover:border-white/20 hover:text-slate-300'}`}>
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results grid */}
        {loading ? (
          <div className="pg-grid">
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : pgs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24">
            <Building2 size={56} className="mx-auto mb-4 text-slate-700" />
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display' }}>No Listings Found</h3>
            <p className="text-slate-400 mb-6">Try a different keyword or remove some filters</p>
            <button onClick={clearFilters} className="btn-primary">Reset Filters</button>
          </motion.div>
        ) : (
          <>
            <div className="pg-grid">
              {pgs.map((pg, i) => <PGCard key={pg._id} pg={pg} index={i} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchPGs(p)}
                    className={`w-10 h-10 rounded-xl font-medium text-sm transition-all duration-200 ${p === page ? 'btn-primary p-0' : 'btn-secondary p-0 border-none'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
