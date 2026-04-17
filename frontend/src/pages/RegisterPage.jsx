import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Eye, EyeOff, Building2, GraduationCap, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      if (result.role === 'owner') navigate('/owner');
      else navigate('/student');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh pt-10">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <Building2 size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: 'Clash Display' }}>PG<span className="gradient-text">Finder</span></span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display' }}>Create your account</h1>
          <p className="text-slate-400">Already have an account?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</Link>
          </p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: 'student', label: 'I am a Student', icon: GraduationCap, desc: 'Looking for a PG' },
            { value: 'owner', label: 'I am an Owner', icon: Building2, desc: 'Listing my property' },
          ].map(({ value, label, icon: Icon, desc }) => (
            <button key={value} type="button" onClick={() => setForm(f => ({ ...f, role: value }))}
              className={`p-4 rounded-xl text-left transition-all duration-200 ${form.role === value
                ? 'border-orange-500/40 bg-orange-500/10 text-white'
                : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/5'
              }`}
              style={{ border: '1px solid' }}>
              <Icon size={20} className={form.role === value ? 'text-orange-400 mb-2' : 'text-slate-600 mb-2'} />
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs opacity-60 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter your full name" required className="input-field pl-11" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" required className="input-field pl-11" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210" className="input-field pl-11" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="At least 6 characters" required minLength={6} className="input-field pl-11 pr-11" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2 text-base">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Create My Account <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-orange-500/70 hover:text-orange-400">Terms</a> and{' '}
          <a href="#" className="text-orange-500/70 hover:text-orange-400">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}
