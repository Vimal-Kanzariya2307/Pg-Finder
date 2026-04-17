import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh pt-20">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
        <div className="text-[120px] font-bold leading-none mb-4 gradient-text" style={{ fontFamily: 'Clash Display' }}>404</div>
        <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Clash Display' }}>Page Not Found</h2>
        <p className="text-slate-400 max-w-sm mx-auto mb-8">We could not find the page you are looking for. It may have been moved or removed.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary"><Home size={16} /> Back Home</Link>
          <Link to="/search" className="btn-secondary"><Search size={16} /> Browse PGs</Link>
        </div>
      </motion.div>
    </div>
  );
}
