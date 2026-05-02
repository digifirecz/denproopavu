import React, { useState } from 'react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase.ts';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function User() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Nová hesla se neshodují.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků.');
      return;
    }

    setLoading(true);

    try {
      if (!user || !user.email) throw new Error('Uživatel není přihlášen.');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      setSuccess('Heslo bylo úspěšně změněno.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Heslo změněno');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Původní heslo je nesprávné.');
      } else {
        setError('Při změně hesla došlo k chybě. Zkuste to prosím později.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20 text-left animate-in fade-in duration-700">
      {/* Header section */}
      <header className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm shadow-slate-200/50 text-slate-900 text-left">
        <div className="text-left">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">Můj profil</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 leading-none">{user?.email}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <ShieldCheck size={24} />
        </div>
      </header>

      {/* Profile Form section */}
      <section className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm space-y-12 max-w-4xl">
        <div className="text-left space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <Key className="text-brand-teal" size={20} />
            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">
              Změna hesla
            </h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-red/10 border border-brand-red/20 p-4 rounded-xl text-brand-red text-sm font-bold flex items-center gap-3"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-teal/10 border border-brand-teal/20 p-4 rounded-xl text-brand-teal text-sm font-bold flex items-center gap-3"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                {success}
              </motion.div>
            )}

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Původní heslo</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-5 py-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-teal/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nové heslo</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-5 py-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-teal/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Potvrzení nového hesla</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-5 py-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-teal/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-brand-teal text-black font-black uppercase tracking-widest rounded-xl hover:bg-brand-teal-light transition-all flex items-center justify-center gap-2 group shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Ukládání...' : 'Změnit heslo'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
