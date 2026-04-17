import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, MapPin, Building2, Shield, Star, Users, ArrowRight, CheckCircle2, Zap, Home } from 'lucide-react';
import PGCard from '../components/pg/PGCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import api from '../utils/api';

const HERO_CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];

const stats = [
  { value: '50,000+', label: 'Active Listings', icon: Building2 },
  { value: '1.2L+', label: 'Students Helped', icon: Users },
  { value: '200+', label: 'Cities Covered', icon: MapPin },
  { value: '4.8★', label: 'User Rating', icon: Star },
];

const features = [
  { icon: Shield, title: 'Verified Listings', desc: 'Every listing is reviewed so you can shortlist with confidence.' },
  { icon: Zap, title: 'Quick Responses', desc: 'Message owners directly and usually hear back the same day.' },
  { icon: Star, title: 'Real Reviews', desc: 'Read honest feedback from students who have actually stayed there.' },
  { icon: CheckCircle2, title: 'No Brokerage', desc: 'Connect directly with owners and avoid extra middleman fees.' },
];

const AnimatedCounter = ({ target, suffix = '' }) => {
  return <span>{target}{suffix}</span>;
};

export default function HomePage() {
  const [searchCity, setSearchCity] = useState('');
  const [searchGender, setSearchGender] = useState('');
  const [featuredPGs, setFeaturedPGs] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [cityIndex, setCityIndex] = useState(0);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);

  useEffect(() => {
    const interval = setInterval(() => setCityIndex(i => (i + 1) % HERO_CITIES.length), 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.get('/pg/featured').then(({ data }) => { setFeaturedPGs(data.data || []); setLoadingFeatured(false); })
      .catch(() => { setLoadingFeatured(false); });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchGender) params.set('gender', searchGender);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-mesh min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #f97316, transparent)', filter: 'blur(60px)' }} />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(60px)' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>

        <motion.div style={{ y: heroY }} className="relative page-container w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-orange text-orange-400 text-sm font-medium mb-6">
              <span className="glow-dot" />
              Trusted by students across India
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Find a Place
              <br />
              <span className="gradient-text">That Feels Like</span>
              <br />
              Home
            </motion.h1>

            {/* Animated city */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="flex items-center justify-center gap-2 mb-8 text-slate-400 text-lg">
              <MapPin size={16} className="text-orange-500" />
              Popular in{' '}
              <span className="relative overflow-hidden inline-block h-7 w-32">
                <motion.span key={cityIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="absolute text-orange-400 font-semibold"
                  style={{ fontFamily: 'Clash Display' }}>
                  {HERO_CITIES[cityIndex]}
                </motion.span>
              </span>
              and more
            </motion.div>

            {/* Search bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl glass"
                style={{ border: '1px solid rgba(249,115,22,0.2)' }}>
                <div className="flex-1 flex items-center gap-3 px-3">
                  <MapPin size={16} className="text-orange-500 shrink-0" />
                  <input
                    value={searchCity}
                    onChange={e => setSearchCity(e.target.value)}
                    placeholder="Try Pune, Indiranagar, Andheri..."
                    className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                  />
                </div>
                <select value={searchGender} onChange={e => setSearchGender(e.target.value)}
                  className="select-field sm:w-32 text-sm">
                  <option value="">Any Preference</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Co-ed">Co-ed</option>
                </select>
                <button type="submit" className="btn-primary sm:px-6 gap-2">
                  <Search size={16} />
                  Find PGs
                </button>
              </form>
            </motion.div>

            {/* Quick city pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-slate-500 text-xs">Popular searches:</span>
              {['Bangalore', 'Mumbai', 'Pune', 'Delhi', 'Hyderabad'].map(city => (
                <button key={city} onClick={() => { setSearchCity(city); }}
                  className="px-3 py-1 rounded-full text-xs text-slate-400 hover:text-orange-400 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {city}
                </button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
          <span className="text-xs">Scroll for more</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-orange-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.15)' }}>
                  <Icon size={20} className="text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Clash Display' }}>{value}</div>
                <div className="text-slate-500 text-sm">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured PGs */}
      <section className="py-20">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="text-orange-500 text-sm font-medium mb-2 uppercase tracking-widest">
                Recommended for you
              </motion.p>
              <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="section-title text-white">
                Popular <span className="gradient-text">Listings</span>
              </motion.h2>
            </div>
            <motion.a initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              href="/search"
              className="hidden md:flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-sm font-medium">
              See all <ArrowRight size={15} />
            </motion.a>
          </div>

          <div className="pg-grid">
            {loadingFeatured
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : featuredPGs.length > 0
                ? featuredPGs.map((pg, i) => <PGCard key={pg._id} pg={pg} index={i} />)
                : (
                  <div className="col-span-full text-center py-16 text-slate-500">
                    <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Featured listings are on the way. Check back soon.</p>
                  </div>
                )
            }
          </div>

          <div className="text-center mt-8 md:hidden">
            <a href="/search" className="btn-secondary">See All Listings <ArrowRight size={15} /></a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-mesh-2">
        <div className="page-container">
          <div className="text-center mb-14">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-orange-500 text-sm font-medium mb-2 uppercase tracking-widest">Why Students Choose Us</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="section-title text-white">
              Made for <span className="gradient-text">Student Life</span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6 rounded-2xl text-center group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(236,72,153,0.1))', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <Icon size={24} className="text-orange-400" />
                </div>
                <h3 className="text-white font-semibold mb-2" style={{ fontFamily: 'Clash Display' }}>{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 70% 50%, #6366f1 0%, transparent 50%)' }} />
            <div className="relative">
              <h2 className="section-title text-white mb-4">
                Own a PG? <span className="gradient-text">List It for Free</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">
                Reach students who are actively looking for accommodation in your area. No listing fee and no brokerage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/register" className="btn-primary text-base px-8 py-3.5">
                  <Home size={18} /> List Your Property
                </a>
                <a href="/search" className="btn-secondary text-base px-8 py-3.5">
                  <Search size={18} /> Explore Listings
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
