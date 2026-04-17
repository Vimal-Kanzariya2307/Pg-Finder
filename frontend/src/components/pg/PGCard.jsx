import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, Wifi, Wind, Utensils, Car, Eye, Users } from 'lucide-react';
import { formatPrice, getPGImage, getMinRent, amenityIcons } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';

const amenityIconComponents = { WiFi: Wifi, AC: Wind, Meals: Utensils, Parking: Car };

export default function PGCard({ pg, index = 0 }) {
  const { user, isFavorite, toggleFavorite } = useAuthStore();
  const minRent = getMinRent(pg);
  const imgUrl = getPGImage(pg);
  const favorited = isFavorite(pg._id);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleFavorite(pg._id);
  };

  const genderColor = pg.gender === 'Male' ? 'badge-blue' : pg.gender === 'Female' ? 'badge-orange' : 'badge-green';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      className="animated-border rounded-2xl">
      <Link to={`/pg/${pg._id}`} className="block card rounded-2xl overflow-hidden group h-full">
        {/* Image */}
        <div className="pg-card-image">
          <img src={imgUrl} alt={pg.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'; }} />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`badge ${genderColor}`}>{pg.gender}</span>
            {pg.isFeatured && (
              <span className="badge" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white' }}>
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Favorite button */}
          {user && (
            <button onClick={handleFavorite}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center glass transition-all duration-300 hover:scale-110 ${favorited ? 'text-red-400 bg-red-500/20' : 'text-slate-300 hover:text-red-400'}`}>
              <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
            </button>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              {minRent && (
                <div className="text-white font-bold text-lg" style={{ fontFamily: 'Clash Display' }}>
                  {formatPrice(minRent)}
                  <span className="text-xs font-normal text-slate-300">/mo</span>
                </div>
              )}
            </div>
            {pg.averageRating > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg glass text-xs">
                <Star size={11} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{pg.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-white text-base leading-snug line-clamp-1 group-hover:text-orange-400 transition-colors" style={{ fontFamily: 'Clash Display' }}>
              {pg.title}
            </h3>
            <span className="badge badge-orange shrink-0 text-xs">{pg.type}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3">
            <MapPin size={11} className="text-orange-500" />
            <span className="line-clamp-1">{pg.address?.area}, {pg.address?.city}</span>
          </div>

          {/* Amenities */}
          {pg.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {pg.amenities.slice(0, 4).map(amenity => (
                <span key={amenity} className="text-xs px-2 py-0.5 rounded-md text-slate-400"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {amenityIcons[amenity]} {amenity}
                </span>
              ))}
              {pg.amenities.length > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-md text-orange-400"
                  style={{ background: 'rgba(249,115,22,0.1)' }}>
                  +{pg.amenities.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer stats */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users size={11} />
              <span>{pg.availableRooms} room{pg.availableRooms !== 1 ? 's' : ''} left</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Eye size={11} />
              <span>{pg.views} views</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
