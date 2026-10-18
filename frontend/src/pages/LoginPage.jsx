import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Building2, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading, googleLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'owner') navigate('/owner');
      else navigate('/student');
    }
  };
  const handleGoogleLogin = async (e) => {
    e?.preventDefault();
    const result = await googleLogin();

    if (result.success) {
      if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'owner') navigate('/owner');
      else navigate('/student');
    }
  };

  return (
    <div className="min-h-screen flex bg-mesh">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(99,102,241,0.05) 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #f97316, transparent)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(40px)' }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>
        <div className="relative z-10 text-center px-10 max-w-md">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <Building2 size={36} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Clash Display' }}>
            Welcome to <span className="gradient-text">PGFinder</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            A simpler way to find verified PG stays near your college or workplace.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[['50K+', 'Listings'], ['1.2L+', 'Students'], ['4.8★', 'User Rating'], ['0', 'Brokerage']].map(([v, l]) => (
              <div key={l} className="p-4 rounded-2xl glass text-center">
                <div className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Clash Display' }}>{v}</div>
                <div className="text-slate-400 text-xs mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Clash Display' }}>PG<span className="gradient-text">Finder</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Clash Display' }}>Welcome back</h1>
            <p className="text-slate-400">New here?{' '}
              <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium">Create a free account</Link>
            </p>
          </div>

          {/* Demo accounts
          <div className="mb-6 p-4 rounded-xl glass-orange">
            <p className="text-xs text-orange-400 font-medium mb-2">Try demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'Student', email: 'student@demo.com', pass: 'demo1234' },
                { role: 'Owner', email: 'owner@demo.com', pass: 'demo1234' },
                { role: 'Admin', email: 'admin@demo.com', pass: 'admin1234' },
              ].map(({ role, email, pass }) => (
                <button key={role} onClick={() => setForm({ email, password: pass })}
                  className="text-xs py-1.5 px-2 rounded-lg text-center hover:bg-orange-500/20 transition-colors text-slate-400 hover:text-orange-400"
                  style={{ border: '1px solid rgba(249,115,22,0.15)' }}>
                  {role}
                </button>
              ))}
            </div>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@gmail.com" required className="input-field pl-11" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" required className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 text-base">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black py-3 rounded-xl mt-4 font-semibold"
            >
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            By continuing, you agree to our{' '}
            <a href="#" className="text-orange-500/70 hover:text-orange-400">Terms</a> and{' '}
            <a href="#" className="text-orange-500/70 hover:text-orange-400">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
