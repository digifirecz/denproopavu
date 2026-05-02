import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Cookie, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Privacy() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    title: 'Den pro Brno',
    email: 'info@denprobrno.cz',
    copyright: '© 2026 DEN PRO BRNO',
    updatedAt: '29. 04. 2026'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const globalDoc = await getDoc(doc(db, 'settings', 'global'));
        const contactDoc = await getDoc(doc(db, 'settings', 'contact'));
        
        let dynamicSettings = { ...settings };

        if (globalDoc.exists()) {
          const data = globalDoc.data();
          dynamicSettings.title = data.title || settings.title;
          dynamicSettings.copyright = data.copyright || settings.copyright;
          if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
            const date = data.updatedAt.toDate();
            dynamicSettings.updatedAt = date.toLocaleDateString('cs-CZ');
          } else if (data.updatedAt) {
            // Fallback if it's already a string or date
            const date = new Date(data.updatedAt);
            if (!isNaN(date.getTime())) {
              dynamicSettings.updatedAt = date.toLocaleDateString('cs-CZ');
            }
          }
        }

        if (contactDoc.exists()) {
          const data = contactDoc.data();
          dynamicSettings.email = data.email || settings.email;
        }

        setSettings(dynamicSettings);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-teal selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-brand-teal transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Zpět na web</span>
          </button>
          <div className="flex items-center gap-3">
            <Shield className="text-brand-teal" size={24} />
            <h1 className="text-sm font-black uppercase tracking-tighter text-slate-900">Ochrana soukromí</h1>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-16 border border-slate-100"
        >
          <div className="space-y-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">1. Správce údajů</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Správcem osobních údajů v souvislosti s webovými stránkami <strong>{settings.title}</strong> je provozovatel webu. Pokud máte jakékoli dotazy ohledně vašich údajů, kontaktujte nás na <a href={`mailto:${settings.email}`} className="text-brand-teal hover:underline">{settings.email}</a>.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">2. Jaké údaje sbíráme</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 shrink-0" />
                  <p className="text-slate-600 leading-relaxed font-medium">
                    <strong className="text-slate-900">Google Analytics:</strong> Používáme anonymizované statistiky návštěvnosti (cookies), které nám pomáhají pochopit, jaký obsah vás nejvíce zajímá. Tyto údaje neobsahují vaše jméno, e-mail ani jiné přímo identifikovatelné informace.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 shrink-0" />
                  <p className="text-slate-600 leading-relaxed font-medium">
                    <strong className="text-slate-900">Kontaktní formulář:</strong> Pokud nám pošlete zprávu prostřednictvím formuláře, ukládáme vaše jméno a e-mailovou adresu pouze za účelem odpovědi na váš dotaz.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">3. Účel zpracování</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Vaše údaje zpracováváme výhradně pro:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Zlepšování webu', 'Odpovědi na dotazy', 'Organizace akce', 'Statistické analýzy'].map((item) => (
                  <li key={item} className="bg-slate-50 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-teal/20" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">4. Vaše práva</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Podle GDPR máte právo na přístup k údajům, jejich opravu, výmaz, nebo omezení zpracování. Pokud jste souhlasili se cookies, můžete svůj souhlas kdykoli odvolat smazáním cookies ve vašem prohlížeči nebo změnou nastavení zde:
              </p>
              <button 
                onClick={() => window.dispatchEvent(new Event('show-cookie-consent'))}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-brand-teal transition-all active:scale-95"
              >
                <Cookie size={14} />
                Změnit nastavení cookies
              </button>
            </section>

            <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-4">
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Platné od</p>
              <p className="text-sm font-black text-slate-900 tabular-nums tracking-tighter">{settings.updatedAt}</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{settings.copyright || `© ${new Date().getFullYear()} ${settings.title}`} — VYROBENO S LÁSKOU K BRNU</p>
        </div>
      </footer>
    </div>
  );
}

