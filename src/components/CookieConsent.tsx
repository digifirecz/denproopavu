import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }

    const showConsent = () => setIsVisible(true);
    window.addEventListener('show-cookie-consent', showConsent);
    return () => window.removeEventListener('show-cookie-consent', showConsent);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    window.dispatchEvent(new Event('cookie-consent-updated'));
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
    window.dispatchEvent(new Event('cookie-consent-updated'));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          id="cookie-consent-banner"
          className="fixed bottom-6 right-6 z-[9999] w-[calc(100%-3rem)] max-w-sm"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal shrink-0">
                <Cookie size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-900 tracking-tighter uppercase">Soukromí a Cookies</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Používáme cookies k analýze návštěvnosti a vylepšení našeho webu. Pomozte nám lépe plánovat další ročníky!
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleAccept}
                className="w-full bg-brand-teal text-white py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-opacity-90 transition-all shadow-lg shadow-brand-teal/20 active:scale-95"
              >
                Přijmout vše
              </button>
              <button
                onClick={handleDecline}
                className="w-full bg-slate-100 text-slate-500 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all active:scale-95"
              >
                Pouze nezbytné
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Info size={12} className="text-slate-400" />
              <Link 
                to="/gdpr"
                onClick={() => setIsVisible(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-brand-teal transition-colors uppercase tracking-widest underline underline-offset-4"
              >
                Více informací
              </Link>
            </div>

            {/* Close Button UI-only */}
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-1 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
