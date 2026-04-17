import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, DollarSign, Image, ChevronRight, ChevronLeft, Check, X, Plus } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { AMENITIES_LIST, amenityIcons } from '../../utils/helpers';

const STEPS = ['Basics', 'Location', 'Pricing', 'Amenities', 'Photos'];

const initialForm = {
  title: '', description: '', type: 'PG', gender: 'Male',
  address: { street: '', area: '', city: '', state: '', pincode: '', landmark: '' },
  rent: { single: '', double: '', triple: '' },
  deposit: '',
  amenities: [],
  rules: [],
  totalRooms: 1, availableRooms: 1,
};

export default function AddPGPage() {
  const MAX_PHOTOS = 10;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [photoItems, setPhotoItems] = useState([]);
  const [imageLinkInput, setImageLinkInput] = useState('');
  const [newRule, setNewRule] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const objectUrlsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const updateAddress = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));
  const updateRent = (key, val) => setForm(f => ({ ...f, rent: { ...f.rent, [key]: val } }));

  const toggleAmenity = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }));

  const addRule = () => {
    if (newRule.trim()) {
      setForm(f => ({ ...f, rules: [...f.rules, newRule.trim()] }));
      setNewRule('');
    }
  };

  const isValidImageLink = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = Math.max(0, MAX_PHOTOS - photoItems.length);
    if (remainingSlots === 0) {
      toast.error('You can add up to 10 photos.');
      e.target.value = '';
      return;
    }

    const acceptedFiles = files.slice(0, remainingSlots);
    const newFileItems = acceptedFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(previewUrl);
      return {
        id: `${Date.now()}-${Math.random()}`,
        kind: 'file',
        file,
        previewUrl,
      };
    });

    setPhotoItems((prev) => [...prev, ...newFileItems]);

    if (files.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more photo(s) can be added.`);
    }

    e.target.value = '';
  };

  const addImageLink = () => {
    const link = imageLinkInput.trim();
    if (!link) return;

    if (!isValidImageLink(link)) {
      toast.error('Please paste a valid image link.');
      return;
    }

    if (photoItems.length >= MAX_PHOTOS) {
      toast.error('You can add up to 10 photos.');
      return;
    }

    if (photoItems.some((item) => item.previewUrl === link)) {
      toast.error('This image link is already added.');
      return;
    }

    setPhotoItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        kind: 'url',
        url: link,
        previewUrl: link,
      },
    ]);
    setImageLinkInput('');
  };

  const removePhoto = (id) => {
    setPhotoItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.kind === 'file') {
        URL.revokeObjectURL(target.previewUrl);
        objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      const linkedPhotos = photoItems
        .filter((item) => item.kind === 'url')
        .map((item) => ({ url: item.url, public_id: '' }));

      const pgData = {
        ...form,
        photos: linkedPhotos,
        rent: {
          single: form.rent.single ? Number(form.rent.single) : undefined,
          double: form.rent.double ? Number(form.rent.double) : undefined,
          triple: form.rent.triple ? Number(form.rent.triple) : undefined,
        },
        deposit: form.deposit ? Number(form.deposit) : 0,
        totalRooms: Number(form.totalRooms),
        availableRooms: Number(form.availableRooms),
      };
      formData.append('data', JSON.stringify(pgData));
      photoItems
        .filter((item) => item.kind === 'file')
        .forEach((item) => formData.append('photos', item.file));

      await api.post('/pg', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing published successfully. Students can now view it.');
      navigate('/owner');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not publish listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return form.title && form.description && form.type && form.gender;
    if (step === 1) return form.address.street && form.address.area && form.address.city && form.address.state && form.address.pincode;
    if (step === 2) return form.rent.single || form.rent.double || form.rent.triple;
    return true;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-mesh">
      <div className="page-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Clash Display' }}>Create New Listing</h1>
          <p className="text-slate-400">Add key details so students can discover your property.</p>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center mb-10 gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex flex-col items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'text-white' : 'text-slate-500'
                }`} style={i === step ? { background: 'linear-gradient(135deg, #f97316, #ea580c)' } : i < step ? {} : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 hidden sm:block ${i === step ? 'text-orange-400 font-medium' : i < step ? 'text-green-400' : 'text-slate-600'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2 transition-all duration-500"
                  style={{ background: i < step ? 'linear-gradient(90deg, #22c55e, #22c55e)' : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="card rounded-2xl p-6 md:p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }} className="space-y-5">

              {/* Step 0: Basic Info */}
              {step === 0 && (
                <>
                  <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Clash Display' }}>
                    <Building2 size={20} className="inline text-orange-500 mr-2" />Basic Details
                  </h2>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">PG Title *</label>
                    <input value={form.title} onChange={e => updateForm('title', e.target.value)}
                      placeholder="e.g. Green Nest PG near Metro" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Description *</label>
                    <textarea value={form.description} onChange={e => updateForm('description', e.target.value)}
                      placeholder="Describe location highlights, nearby facilities, and what makes your place stand out..." rows={4} className="input-field resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Type *</label>
                      <select value={form.type} onChange={e => updateForm('type', e.target.value)} className="select-field">
                        {['PG', 'Hostel', 'Apartment', 'Studio'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Gender *</label>
                      <select value={form.gender} onChange={e => updateForm('gender', e.target.value)} className="select-field">
                        {['Male', 'Female', 'Co-ed'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Total Rooms</label>
                      <input type="number" value={form.totalRooms} onChange={e => updateForm('totalRooms', e.target.value)} min={1} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Available Rooms</label>
                      <input type="number" value={form.availableRooms} onChange={e => updateForm('availableRooms', e.target.value)} min={0} className="input-field" />
                    </div>
                  </div>
                </>
              )}

              {/* Step 1: Location */}
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Clash Display' }}>
                    <MapPin size={20} className="inline text-orange-500 mr-2" />Address Details
                  </h2>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Street Address *</label>
                    <input value={form.address.street} onChange={e => updateAddress('street', e.target.value)} placeholder="House no., Street name" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Area / Locality *</label>
                      <input value={form.address.area} onChange={e => updateAddress('area', e.target.value)} placeholder="Koramangala" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">City *</label>
                      <input value={form.address.city} onChange={e => updateAddress('city', e.target.value)} placeholder="Bangalore" className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">State *</label>
                      <input value={form.address.state} onChange={e => updateAddress('state', e.target.value)} placeholder="Karnataka" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Pincode *</label>
                      <input value={form.address.pincode} onChange={e => updateAddress('pincode', e.target.value)} placeholder="560034" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Landmark (Optional)</label>
                    <input value={form.address.landmark} onChange={e => updateAddress('landmark', e.target.value)} placeholder="Near XYZ Mall" className="input-field" />
                  </div>
                </>
              )}

              {/* Step 2: Pricing */}
              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Clash Display' }}>
                    <DollarSign size={20} className="inline text-orange-500 mr-2" />Rent Details
                  </h2>
                  <p className="text-slate-400 text-sm mb-4">Please enter rent for at least one room type.</p>
                  {[
                    { key: 'single', label: 'Single Occupancy', hint: 'One person per room' },
                    { key: 'double', label: 'Double Occupancy', hint: 'Two people per room' },
                    { key: 'triple', label: 'Triple Occupancy', hint: 'Three people per room' },
                  ].map(({ key, label, hint }) => (
                    <div key={key} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white text-sm font-medium">{label}</p>
                          <p className="text-slate-500 text-xs">{hint}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                        <input type="number" value={form.rent[key]}
                          onChange={e => updateRent(key, e.target.value)}
                          placeholder="0" className="input-field pl-8" min={0} />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Security Deposit</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                      <input type="number" value={form.deposit} onChange={e => updateForm('deposit', e.target.value)} placeholder="0" className="input-field pl-8" min={0} />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Amenities + Rules */}
              {step === 3 && (
                <>
                  <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>Amenities & Rules</h2>
                  <div className="mb-6">
                    <label className="block text-xs text-slate-400 mb-3 uppercase tracking-wider">Select Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AMENITIES_LIST.map(amenity => (
                        <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                            form.amenities.includes(amenity)
                              ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                              : 'text-slate-400 hover:text-slate-300'
                          }`}
                          style={{ border: '1px solid', borderColor: form.amenities.includes(amenity) ? undefined : 'rgba(255,255,255,0.08)' }}>
                          <span>{amenityIcons[amenity]}</span> {amenity}
                          {form.amenities.includes(amenity) && <Check size={12} className="ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-3 uppercase tracking-wider">House Rules (Optional)</label>
                    <div className="flex gap-2 mb-3">
                      <input value={newRule} onChange={e => setNewRule(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRule())}
                        placeholder="e.g. No smoking on premises" className="input-field flex-1 text-sm" />
                      <button type="button" onClick={addRule} className="btn-primary px-4 py-2.5 text-sm">
                        <Plus size={16} />
                      </button>
                    </div>
                    {form.rules.length > 0 && (
                      <div className="space-y-2">
                        {form.rules.map((rule, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span className="text-orange-500">•</span>
                            <span className="flex-1">{rule}</span>
                            <button onClick={() => setForm(f => ({ ...f, rules: f.rules.filter((_, idx) => idx !== i) }))}
                              className="text-slate-600 hover:text-red-400 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 4: Photos */}
              {step === 4 && (
                <>
                  <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>
                    <Image size={20} className="inline text-orange-500 mr-2" />Add Photos
                  </h2>
                  <p className="text-slate-400 text-sm mb-4">Add up to 10 photos. Clear photos help students decide faster.</p>

                  <label className="block cursor-pointer">
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 hover:border-orange-500/50 hover:bg-orange-500/5 ${
                      photoItems.length > 0 ? 'border-orange-500/30' : 'border-white/10'
                    }`}>
                      <Image size={32} className="mx-auto mb-3 text-slate-600" />
                      <p className="text-slate-400 text-sm font-medium">Click to upload images</p>
                      <p className="text-slate-600 text-xs mt-1">JPG, PNG, WebP up to 5MB each</p>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>

                  <div className="mt-3">
                    <p className="text-slate-500 text-xs mb-2">Or paste an image address link</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={imageLinkInput}
                        onChange={(e) => setImageLinkInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageLink())}
                        placeholder="https://example.com/photo.jpg"
                        className="input-field text-sm"
                      />
                      <button type="button" onClick={addImageLink} className="btn-secondary whitespace-nowrap">
                        Add Link
                      </button>
                    </div>
                  </div>

                  {photoItems.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                      {photoItems.map((item, i) => (
                        <div key={item.id} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
                          <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removePhoto(item.id)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                            <X size={12} />
                          </button>
                          {i === 0 && (
                            <div className="absolute bottom-1.5 left-1.5 text-xs px-1.5 py-0.5 rounded bg-orange-500 text-white font-medium">Cover</div>
                          )}
                          {item.kind === 'url' && (
                            <div className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-200 border border-white/10">Link</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={18} /> Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publishing...</>
              ) : (
                <><Check size={18} /> Publish Listing</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
