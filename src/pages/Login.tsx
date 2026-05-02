import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';
      
      if (errorCode === 'auth/invalid-credential' || 
          errorCode === 'auth/wrong-password' || 
          errorCode === 'auth/user-not-found' || 
          errorCode === 'auth/invalid-email' ||
          errorMessage.includes('auth/invalid-credential')) {
        setError('Nesprávný e-mail nebo heslo. Zkontrolujte prosím své údaje.');
      } else if (errorCode === 'auth/too-many-requests') {
        setError('Příliš mnoho neúspěšných pokusů. Účet je dočasně zablokován. Zkuste to prosím později nebo si nechte poslat odkaz na obnovu hesla.');
      } else if (errorCode === 'auth/network-request-failed') {
        setError('Chyba sítě. Zkontrolujte prosím své připojení.');
      } else {
        setError('Při přihlašování došlo k chybě. Zkuste to prosím znovu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Prosím zadejte svůj e-mail.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess('E-mail pro obnovu hesla byl odeslán. Zkontrolujte svou schránku.');
      // Keep isResetting true to show the message
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('Uživatel s tímto e-mailem nebyl nalezen.');
      } else {
        setError('Při odesílání e-mailu došlo k chybě. Zkuste to prosím později.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen brand-gradient flex items-center justify-center p-6 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-12">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-white/50 hover:text-white transition-all font-bold uppercase tracking-[0.2em] text-[11px] px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 shadow-xl"
          >
            <ArrowLeft size={14} /> 
            Zpět na hlavní web
          </Link>
        </div>

        <div className="glass-card bg-black/40 p-8 md:p-10 border-white/10 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!isResetting ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-center bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Administrace</h2>
                
                <form onSubmit={handleLogin} className="space-y-6">
                  {error && (
                    <div className="bg-brand-red/20 border border-brand-red/30 p-4 rounded-xl text-brand-red text-sm font-bold text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-teal/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Heslo</label>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsResetting(true);
                          setError('');
                          setSuccess('');
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-brand-teal hover:text-brand-teal-light transition-colors mr-1"
                      >
                        Zapomenuté heslo?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-teal/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-brand-teal text-black font-black uppercase tracking-widest rounded-xl hover:bg-brand-teal-light transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-teal/20"
                  >
                    {loading ? 'Přihlašování...' : 'Vstoupit'}
                    {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mb-4">
                    <Lock className="text-brand-teal" size={32} />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-center bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Obnova hesla</h2>
                  <p className="text-sm text-white/40 mt-2 text-center max-w-[200px] leading-relaxed">
                    Zadejte svůj e-mail a my vám pošleme odkaz pro změnu hesla.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  {error && (
                    <div className="bg-brand-red/20 border border-brand-red/30 p-4 rounded-xl text-brand-red text-sm font-bold text-center">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-brand-teal/20 border border-brand-teal/30 p-4 rounded-xl text-brand-teal text-sm font-bold text-center">
                      {success}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-teal/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-brand-teal text-black font-black uppercase tracking-widest rounded-xl hover:bg-brand-teal-light transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-teal/20"
                    >
                      {loading ? 'Odesílání...' : 'Poslat odkaz'}
                      {!loading && <Send size={18} className="transition-transform group-hover:translate-x-1" />}
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        setIsResetting(false);
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={12} />
                      Zpět na přihlášení
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
