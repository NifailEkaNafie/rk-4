import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Lock, Mail, Target, Loader2, Fingerprint, Activity, ArrowRight
} from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AuthView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Autentikasi Gagal! Periksa Email/Password Anda.");
      setLoading(false);
    } else {
      onLoginSuccess(data.session);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans overflow-hidden relative selection:bg-orange-200 selection:text-orange-900">
      
      {/* Ultra-soft Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 flex justify-center items-center">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-rose-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-yellow-50/60 rounded-full blur-[80px]" />
      </div>

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center space-y-4">
            <div className="w-14 h-14 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl flex items-center justify-center shadow-sm">
              <Fingerprint className="text-orange-400" strokeWidth={1.5} size={28} />
            </div>
            
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="text-orange-400" strokeWidth={2} size={24} />
                <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">
                  TRX<span className="text-orange-400/80 font-light">Gateway</span>
                </h1>
              </div>
              <p className="text-stone-500 text-sm">
                Alumni Tracking System
              </p>
            </div>
          </div>

          {/* Clean Modern Card */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="text-orange-400" size={18} strokeWidth={2} />
                <p className="uppercase text-[10px] tracking-[0.2em] font-bold text-orange-400/80">
                  Portal Operator
                </p>
              </div>
              <h2 className="text-2xl font-medium text-stone-800 tracking-tight">
                Selamat Datang
              </h2>
            </div>

            <form onSubmit={handleLogin} className="px-8 pb-8 space-y-6">
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <Lock size={18} className="mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-stone-500 ml-1">
                    EMAIL
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-400 transition-colors" size={18} strokeWidth={1.5} />
                    <input 
                      required 
                      type="email" 
                      autoFocus
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-stone-200/60 rounded-2xl focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 outline-none text-stone-700 placeholder:text-stone-400 transition-all text-sm"
                      placeholder="admin@muhammadiyah.ac.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-stone-500 ml-1">
                    PASSPHRASE
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-400 transition-colors" size={18} strokeWidth={1.5} />
                    <input 
                      required 
                      type="password" 
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-stone-200/60 rounded-2xl focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 outline-none text-stone-700 placeholder:text-stone-400 transition-all text-sm"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full group bg-stone-800 hover:bg-stone-900 text-stone-50 py-3.5 rounded-2xl font-medium text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-stone-900/10 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-stone-400" />
                    <span className="tracking-wide">Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide">Masuk ke Dashboard</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-stone-100/50 bg-white/30 text-center">
              <p className="text-[11px] text-stone-400">
                © 2026 UMM • <span className="text-stone-500">Centralized Tracking</span>
              </p>
            </div>
          </div>

          {/* Minimalist Status */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500 tracking-wide">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              System Operational
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}