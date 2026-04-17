import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Trash2, X, Plus } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { AMENITIES_LIST, amenityIcons } from '../../utils/helpers';

export default function EditPGPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    api.get(`/pg/${id}`).then(({ data }) => {
      const pg = data.data;
      setForm({
        title: pg.title || '', description: pg.description || '',
        type: pg.type || 'PG', gender: pg.gender || 'Male',
        address: pg.address || { street: '', area: '', city: '', state: '', pincode: '', landmark: '' },
        rent: { single: pg.rent?.single || '', double: pg.rent?.double || '', triple: pg.rent?.triple || '' },
        deposit: pg.deposit || '',
        amenities: pg.amenities || [],
        rules: pg.rules || [],
        totalRooms: pg.totalRooms || 1,
        availableRooms: pg.availableRooms || 1,
        photos: pg.photos || [],
        status: pg.status,
      });
      setLoading(false);
    }).catch(() => { toast.error('Listing not found.'); navigate('/owner'); });
  }, [id]);

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const updateAddress = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));
  const updateRent = (key, val) => setForm(f => ({ ...f, rent: { ...f.rent, [key]: val } }));
  const toggleAmenity = (a) => setForm(f => ({
    ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }));
  const addRule = () => { if (newRule.trim()) { setForm(f => ({ ...f, rules: [...f.rules, newRule.trim()] })); setNewRule(''); } };

  const handlePhotoUpload = (e) => setPhotos(prev => [...prev, ...Array.from(e.target.files)].slice(0, 10));

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      const pgData = { ...form, photos: form.photos, rent: { single: Number(form.rent.single) || undefined, double: Number(form.rent.double) || undefined, triple: Number(form.rent.triple) || undefined }, deposit: Number(form.deposit) || 0 };
      formData.append('data', JSON.stringify(pgData));
      photos.forEach(p => formData.append('photos', p));
      await api.put(`/pg/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing updated successfully.');
      navigate('/owner');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save changes. Please try again.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>Edit Listing</h1>
            <p className="text-slate-400 mt-1">{form?.title}</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            Save Update
          </button>
        </motion.div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Basic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Title</label>
                <input value={form.title} onChange={e => updateForm('title', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={4} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Type</label>
                  <select value={form.type} onChange={e => updateForm('type', e.target.value)} className="select-field">
                    {['PG', 'Hostel', 'Apartment', 'Studio'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Gender</label>
                  <select value={form.gender} onChange={e => updateForm('gender', e.target.value)} className="select-field">
                    {['Male', 'Female', 'Co-ed'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Total Rooms</label>
                  <input type="number" value={form.totalRooms} onChange={e => updateForm('totalRooms', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Available Rooms</label>
                  <input type="number" value={form.availableRooms} onChange={e => updateForm('availableRooms', e.target.value)} className="input-field" />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['street', 'Street'], ['area', 'Area'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode'], ['landmark', 'Landmark']].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
                  <input value={form.address[key] || ''} onChange={e => updateAddress(key, e.target.value)} className="input-field" />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Pricing</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['single', 'double', 'triple'].map(k => (
                <div key={k}>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">{k} (₹)</label>
                  <input type="number" value={form.rent[k]} onChange={e => updateRent(k, e.target.value)} className="input-field" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Deposit (₹)</label>
                <input type="number" value={form.deposit} onChange={e => updateForm('deposit', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_LIST.map(a => (
                <button key={a} onClick={() => toggleAmenity(a)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${form.amenities.includes(a) ? 'bg-orange-500/15 text-orange-400' : 'text-slate-400'}`}
                  style={{ border: `1px solid ${form.amenities.includes(a) ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                  {amenityIcons[a]} {a}
                </button>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>House Rules</h2>
            <div className="flex gap-2 mb-3">
              <input value={newRule} onChange={e => setNewRule(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRule())}
                placeholder="Add a house rule..." className="input-field flex-1 text-sm" />
              <button onClick={addRule} className="btn-primary px-4 py-2.5"><Plus size={16} /></button>
            </div>
            <div className="space-y-2">
              {form.rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-orange-500">•</span>
                  <span className="flex-1">{rule}</span>
                  <button onClick={() => setForm(f => ({ ...f, rules: f.rules.filter((_, idx) => idx !== i) }))}
                    className="text-slate-600 hover:text-red-400"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Photos */}
          {form.photos?.length > 0 && (
            <div className="card rounded-2xl p-6">
              <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Current Photos</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.photos.map((photo, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Photos */}
          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Add More Images</h2>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-orange-500/40 transition-colors">
                <p className="text-slate-400 text-sm">Click to upload more images</p>
              </div>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {photos.length > 0 && <p className="text-green-400 text-sm mt-2">{photos.length} new image(s) selected</p>}
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 text-base">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            Save All Updates
          </button>
        </div>
      </div>
    </div>
  );
}
