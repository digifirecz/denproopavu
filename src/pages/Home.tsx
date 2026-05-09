import { motion, useScroll, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, addDoc, serverTimestamp, setDoc, getDoc, increment } from 'firebase/firestore';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Music, 
  MessageSquare, 
  Layout, 
  Pause, 
  Mail, 
  Phone,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  Star,
  Wind,
  Menu,
  X,
  Smile,
  Ghost,
  Gamepad2,
  Camera,
  Paintbrush,
  Baby,
  Zap,
  Coffee,
  Rocket,
  Palette,
  ExternalLink
} from 'lucide-react';

import React from 'react';

interface Artist {
  id: string;
  name: string;
  tag: string;
  desc: string;
  video?: string;
  icon?: string;
  imageUrl?: string;
}

interface PracticalInfo {
  id: string;
  label: string;
  text: string;
  sub: string;
  order: number;
}

interface Guest {
  name: string;
  desc: string;
  imageUrl?: string;
}

interface Organizer {
  id: string;
  role: string;
  name: string;
  desc: string;
  imageUrl?: string;
}

interface Talkshow {
  id: string;
  title: string;
  guestsTitle: string;
  guests: Guest[];
  organizersTitle: string;
  organizers: Organizer[];
  desc: string;
  order: number;
  icon?: string;
}

interface FamilyActivity {
  name: string;
  icon: string;
}

interface FamilyProgram {
  id: string;
  title: string;
  tag: string;
  description: string;
  activities: FamilyActivity[];
  mainPoint: string;
  mainPointTime: string;
  order: number;
  icon?: string;
}

interface CommunityItem {
  name: string;
  description: string;
  image?: string;
  link?: string;
}

interface CommunitySection {
  id: string;
  title: string;
  name: string;
  description: string;
  tag?: string;
  items: CommunityItem[];
  order: number;
  icon?: string;
}

interface ProgramHeader {
  topTitle: string;
  description: string;
}

interface InfoHeader {
  topTitle: string;
  description: string;
}

interface AboutSection {
  id: string;
  tag: string;
  title: string;
  description: string;
  size?: 'small' | 'large';
  items?: { name: string; description: string; link?: string; image?: string }[];
  order: number;
}

interface AboutHeader {
  subtitle: string;
}

interface IntroSection {
  id: string;
  tag: string;
  title: string;
  description: string;
  order: number;
}

interface IntroInfoItem {
  id: string;
  icon: string;
  tag: string;
  title: string;
  description: string;
  order: number;
}

const FAMILY_ICON_MAP: Record<string, any> = {
  Star,
  Sparkles,
  Smile,
  Ghost,
  Gamepad2,
  Camera,
  Paintbrush,
  Baby,
  Heart,
  Wind,
  Zap,
  Music,
  Palette,
  Coffee,
  Rocket
};

const COMMUNITY_ICON_MAP: Record<string, any> = {
  Heart,
  Pause,
  Users,
  Smile,
  Star,
  Sparkles,
  Wind,
  Zap,
  Coffee,
  Music,
  Palette,
  Camera,
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  Layout
};

// Helper to check if an image URL is valid
const isValidImageUrl = (url: string | undefined | null) => {
  if (!url) return false;
  if (url.startsWith('/')) return false;
  return url.startsWith('http') || url.startsWith('blob:');
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('uvod');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [musicProgram, setMusicProgram] = useState<Artist[]>([]);
  const [talkshows, setTalkshows] = useState<Talkshow[]>([]);
  const [practicalInfo, setPracticalInfo] = useState<PracticalInfo[]>([]);
  const [familyProgram, setFamilyProgram] = useState<FamilyProgram[]>([]);
  const [communitySections, setCommunitySections] = useState<CommunitySection[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [aboutHeader, setAboutHeader] = useState<AboutHeader>({
    subtitle: 'Příběh festivalu'
  });
  const [contactInfo, setContactInfo] = useState({ 
    email: '', 
    phone: '',
    welcomeText: '',
    tagline: ''
  });
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  // Loading sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setDataReady(true);
    }, 50); // 0.05s (50ms) flash - extremely fast to just cover initials

    return () => clearTimeout(timer);
  }, []);

  // When data is ready, finish loading
  useEffect(() => {
    if (dataReady) {
      const fadeTimeout = setTimeout(() => {
        setIsAppLoading(false);
      }, 500);
      return () => clearTimeout(fadeTimeout);
    }
  }, [dataReady]);

  const [programHeader, setProgramHeader] = useState<ProgramHeader>({
    topTitle: 'Lineup 2026',
    description: 'Po celý den bude probíhat několik typů programu, mezi kterými si každý najde to své'
  });
  const [infoHeader, setInfoHeader] = useState<InfoHeader>({
    topTitle: 'Informace',
    description: 'Vše, co potřebujete vědět před návštěvou festivalu'
  });
  const [heroData, setHeroData] = useState({ 
    imageUrl: '', 
    imageAlt: '',
    moto: 'Naším cílem je přinést do města radost, povzbuzení a naději, která má skutečný přesah',
    quote: 'Přijďte strávit den, který může něco změnit'
  });
  const [globalSettings, setGlobalSettings] = useState({
    logoPassive: '',
    logoPassiveAlt: '',
    logoActive: '',
    logoActiveAlt: '',
    copyright: '',
    faviconAlt: '',
    ogImageUrl: '',
    ogImageAlt: '',
    primaryDomain: ''
  });

  // Fetch Global Settings (Logos, Title, etc.)
  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setGlobalSettings({
          logoPassive: data.logoPassive || '',
          logoPassiveAlt: data.logoPassiveAlt || '',
          logoActive: data.logoActive || '',
          logoActiveAlt: data.logoActiveAlt || '',
          copyright: data.copyright || '',
          faviconAlt: data.faviconAlt || '',
          ogImageUrl: data.ogImageUrl || '',
          ogImageAlt: data.ogImageAlt || '',
          primaryDomain: data.primaryDomain || ''
        });
        if (data.title) {
          document.title = data.title;
        }
        
        // Dynamic Meta Tags
        const updateMeta = (name: string, content: string, isProperty = false) => {
          let meta = document.querySelector(isProperty ? `meta[property='${name}']` : `meta[name='${name}']`);
          if (!meta) {
            meta = document.createElement('meta');
            if (isProperty) meta.setAttribute('property', name);
            else meta.setAttribute('name', name);
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
        };

        // Canonical URL
        let canonical = document.querySelector("link[rel='canonical']");
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.setAttribute('rel', 'canonical');
          document.head.appendChild(canonical);
        }
        const baseDomain = (data.primaryDomain || '').replace(/\/$/, '');
        canonical.setAttribute('href', baseDomain + window.location.pathname);

        // Structured Data (JSON-LD)
        const scriptId = 'structured-data-jsonld';
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.setAttribute('type', 'application/ld+json');
          document.head.appendChild(script);
        }
        
        const eventData = {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": data.title || "",
          "description": data.description || "",
          "image": data.ogImageUrl || data.faviconUrl || "",
          "location": {
            "@type": "Place",
            "name": data.eventLocationName || "",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": data.eventCity || "",
              "addressCountry": "CZ"
            }
          },
          "startDate": data.eventDate && data.eventStartTime ? `${data.eventDate}T${data.eventStartTime}+02:00` : "",
          "endDate": data.eventDate && data.eventEndTime ? `${data.eventDate}T${data.eventEndTime}+02:00` : "",
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
        };
        script.textContent = JSON.stringify(eventData);

        if (data.description) updateMeta('description', data.description);
        if (data.ogTitle) updateMeta('og:title', data.ogTitle, true);
        if (data.ogDescription) updateMeta('og:description', data.ogDescription, true);
        if (data.ogImageUrl) updateMeta('og:image', data.ogImageUrl, true);
        
        // Twitter Card
        updateMeta('twitter:card', 'summary_large_image');
        if (data.ogTitle) updateMeta('twitter:title', data.ogTitle);
        if (data.ogDescription) updateMeta('twitter:description', data.ogDescription);
        if (data.ogImageUrl) updateMeta('twitter:image', data.ogImageUrl);
        if (data.ogImageUrl) updateMeta('og:url', baseDomain, true);
      }
    });
  }, []);

  const [introSections, setIntroSections] = useState<IntroSection[]>([]);
  const [infoItems, setInfoItems] = useState<IntroInfoItem[]>([]);

  const navItems = [
    { name: 'Úvod', href: '#uvod' },
    { name: 'Program', href: '#program' },
    { name: 'O festivalu', href: '#o-festivalu' },
    { name: 'Info', href: '#info' },
    { name: 'Kontakt', href: '#kontakt' },
  ];

  // Fetch Music Program from Firestore
  useEffect(() => {
    const q = query(collection(db, 'musicProgram'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artist));
      setMusicProgram(data);
    });
    return unsubscribe;
  }, []);

  // Fetch Talkshows from Firestore
  useEffect(() => {
    const q = query(collection(db, 'talkshows'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Talkshow));
      setTalkshows(data);
    });
    return unsubscribe;
  }, []);

  // Fetch Practical Info from Firestore
  useEffect(() => {
    const q = query(collection(db, 'practicalInfo'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticalInfo));
      setPracticalInfo(data);
    });
    return unsubscribe;
  }, []);

  // Fetch Family Program from Firestore
  useEffect(() => {
    const q = query(collection(db, 'familyProgram'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const raw = doc.data();
        return { 
          id: doc.id, 
          ...raw,
          activities: (raw.activities || []).map((a: any) => typeof a === 'string' ? { name: a, icon: 'Sparkles' } : a)
        } as FamilyProgram;
      });
      setFamilyProgram(data);
    });
    return unsubscribe;
  }, []);

  // Fetch Community Sections from Firestore
  useEffect(() => {
    const q = collection(db, 'communitySections');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunitySection));
      // Sort in memory to ensure docs without 'order' are not excluded
      const sortedData = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
      setCommunitySections(sortedData);
    });
    return unsubscribe;
  }, []);

  // Fetch Program Header from Firestore
  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'programHeader'), (snapshot) => {
      if (snapshot.exists()) {
        setProgramHeader(snapshot.data() as ProgramHeader);
      }
    }, (err) => console.error("Program Header Error:", err));
  }, []);

  // Fetch Info Header from Firestore
  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'infoHeader'), (snapshot) => {
      if (snapshot.exists()) {
        setInfoHeader(snapshot.data() as InfoHeader);
      }
    }, (err) => console.error("Info Header Error:", err));
  }, []);

  // Fetch About sections
  useEffect(() => {
    const q = query(collection(db, 'aboutSections'), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setAboutSections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AboutSection)));
    }, (err) => console.error("About Sections Error:", err));
  }, []);

  // Fetch About Header
  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'aboutHeader'), (snapshot) => {
      if (snapshot.exists()) {
        setAboutHeader(snapshot.data() as AboutHeader);
      }
    }, (err) => console.error("About Header Error:", err));
  }, []);

  // Fetch Contact Info from Firestore
  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'contact'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setContactInfo(prev => ({ ...prev, ...data }) as typeof contactInfo);
      }
    }, (err) => console.error("Contact Info Error:", err));
  }, []);

  // Fetch Hero Settings
  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'hero'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setHeroData({
          imageUrl: data.imageUrl || '',
          imageAlt: data.imageAlt || '',
          moto: data.moto ?? 'Naším cílem je přinést do města radost, povzbuzení a naději, která má skutečný přesah',
          quote: data.quote ?? 'Přijďte strávit den, který může něco změnit'
        });
      }
    }, (err) => console.error("Hero Data Error:", err));
  }, []);

  // Fetch Intro Sections
  useEffect(() => {
    const q = query(collection(db, 'introSections'), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setIntroSections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IntroSection)));
    });
  }, []);

// Fetch Intro Info Items
  useEffect(() => {
    // Increment visit counter
    const trackVisit = async () => {
      try {
        const visitRef = doc(db, 'settings', 'stats');
        await setDoc(visitRef, { 
          totalVisits: increment(1),
          lastVisit: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("Error tracking visit:", e);
      }
    };
    trackVisit();
    
    // Load GA Script
    const loadGA = async () => {
      const consent = localStorage.getItem('cookie-consent');
      if (consent !== 'accepted') return;

      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        const gaId = settingsDoc.data().gaMeasurementId;
        if (gaId) {
          // Check if already loaded
          if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;

          const script = document.createElement('script');
          script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          script.async = true;
          document.head.appendChild(script);
          
          (window as any).dataLayer = (window as any).dataLayer || [];
          const gtag = (...args: any[]) => { (window as any).dataLayer.push(args); };
          gtag('js', new Date());
          gtag('config', gaId);
        }
      }
    };
    
    loadGA();

    // Listen for consent updates
    window.addEventListener('cookie-consent-updated', loadGA);
    return () => window.removeEventListener('cookie-consent-updated', loadGA);
  }, []);

  // Fetch Intro Info Items
  useEffect(() => {
    const q = query(collection(db, 'introInfoItems'), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setInfoItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IntroInfoItem)));
    });
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contactSubmissions'), {
        ...contactForm,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Chyba při odesílání zprávy. Zkuste to prosím později.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
      const sections = ['uvod', 'program', 'o-festivalu', 'info', 'kontakt'];
      const scrollPosition = window.scrollY + 120;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (window.scrollY + windowHeight >= documentHeight - 50) {
        setActiveSection('kontakt');
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isAppLoading && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "linear" }}
            className="fixed inset-0 z-[9999] bg-brand-red flex items-center justify-center overflow-hidden"
          />
        )}
      </AnimatePresence>

      <motion.div 
        ref={containerRef} 
        className="relative brand-gradient min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAppLoading ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:py-8 pointer-events-none transition-all duration-300">
        <div className={`max-w-7xl mx-auto flex justify-between items-center backdrop-blur-md border rounded-full px-8 py-3 md:py-4 min-h-[64px] md:min-h-[76px] shadow-2xl pointer-events-auto transition-all duration-500 ${
          scrolled ? 'bg-white border-black/10' : 'bg-black/10 border-white/10'
        }`}>
            {isValidImageUrl(scrolled ? globalSettings.logoActive : globalSettings.logoPassive) && (
              <a href="#" className="flex items-center hover:opacity-80 transition-opacity">
                <img 
                  src={scrolled ? globalSettings.logoActive : globalSettings.logoPassive} 
                  alt={scrolled ? globalSettings.logoActiveAlt : globalSettings.logoPassiveAlt} 
                  className="h-7 md:h-9 w-auto transition-all duration-500"
                  referrerPolicy="no-referrer"
                  onError={() => setGlobalSettings(prev => ({ 
                    ...prev, 
                    [scrolled ? 'logoActive' : 'logoPassive']: '' 
                  }))}
                />
              </a>
            )}
          <div className="hidden md:flex items-center space-x-10 ml-auto">
            {navItems.map((item) => (
              <a 
                key={item.name} 
                href={item.href} 
                className={`text-xs font-bold uppercase tracking-[0.25em] transition-all relative group ${
                  activeSection === item.href.slice(1) 
                    ? 'text-brand-teal' 
                    : scrolled 
                      ? 'text-black' 
                      : 'text-white'
                }`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-brand-teal transform origin-left transition-transform duration-300 ${
                  activeSection === item.href.slice(1) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </a>
            ))}
          </div>

          <button 
            className={`md:hidden p-2 pointer-events-auto transition-colors ${scrolled ? 'text-brand-teal' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={28} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={28} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-28 left-6 right-6 p-8 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl md:hidden pointer-events-auto shadow-2xl z-40"
            >
              <div className="flex flex-col space-y-6 items-center">
                {navItems.map((item) => (
                  <a 
                    key={item.name} 
                    href={item.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-bold uppercase tracking-[0.3em] transition-all ${
                      activeSection === item.href.slice(1) ? 'text-brand-teal' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section id="uvod" className="text-white pt-36 pb-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div {...fadeInUp} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full max-w-5xl px-4 z-10"
                >
                  {isValidImageUrl(heroData.imageUrl) && (
                    <img 
                      src={heroData.imageUrl} 
                      alt={heroData.imageAlt} 
                      className="w-full h-auto drop-shadow-2xl rounded-sm md:rounded-xl"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroData(prev => ({ ...prev, imageUrl: '' }))}
                    />
                  )}
                </motion.div>
                {heroData.moto && heroData.moto.trim() !== '' && (
                  <div className="space-y-6 max-w-3xl mx-auto pt-10 md:pt-16">
                    <h1 className="text-lg md:text-2xl font-sans font-medium tracking-tight leading-[1.3] text-center text-white/90 px-4 mb-[80px] pl-[18px] whitespace-pre-wrap">
                      {heroData.moto}
                    </h1>
                  </div>
                )}
              </div>
            </div>

            {/* Vision Sections */}
            <div id="vize" className="lg:col-span-12 scroll-mt-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {introSections.map((section, idx) => (
                  <motion.div 
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`${idx % 2 === 0 ? 'bg-black/20' : 'bg-black/40'} p-10 md:p-14 space-y-8 relative group overflow-hidden rounded-3xl border border-white/5`}
                  >
                    {section.tag && section.tag.trim() !== '' && (
                      <div className="flex items-center gap-4">
                        <div className={`h-0.5 w-8 ${idx % 2 === 0 ? 'bg-brand-yellow' : 'bg-brand-teal'}`} />
                        <p className={`text-xs font-black uppercase tracking-[0.4em] ${idx % 2 === 0 ? 'text-brand-yellow' : 'text-brand-teal'}`}>
                          {section.tag}
                        </p>
                      </div>
                    )}
                    <div className="space-y-4">
                      <h4 className="text-2xl md:text-3xl font-sans font-bold leading-tight tracking-tighter text-white">
                        {section.title}
                      </h4>
                      <p className="text-lg text-white/80 leading-relaxed font-light whitespace-pre-wrap">
                        {section.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Dynamic Info Bar */}
            {infoItems.length > 0 && (
              <div className="lg:col-span-12 relative z-20">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#7A1235] px-8 py-8 md:px-12 md:py-10 rounded-[2rem] shadow-2xl relative border border-white/5 overflow-hidden"
                >
                  <div className="relative flex flex-col md:flex-row flex-wrap gap-8 md:gap-16 items-start justify-start text-left">
                    {infoItems.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        <div className="space-y-2 max-w-xs">
                          <div className="flex items-center gap-3 text-brand-yellow mb-4">
                            {(() => {
                              const Icon = COMMUNITY_ICON_MAP[item.icon] || MapPin;
                              return <Icon size={14} className="fill-current" />;
                            })()}
                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">{item.tag}</p>
                          </div>
                          <h5 className="text-lg md:text-xl font-bold tracking-tight text-white leading-tight">
                            {item.title}
                          </h5>
                          <p className="text-white/40 text-[13px] md:text-sm font-medium leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        {idx < infoItems.length - 1 && (
                          <div className="hidden md:block w-px h-16 bg-white/5 self-center" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Intro end */}
            
            {heroData.quote && heroData.quote.trim() !== '' && (
              <div className="lg:col-span-12 mt-2 mb-2 flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="max-w-2xl text-center space-y-4"
                >
                  <p className="text-lg md:text-2xl font-sans font-medium tracking-tight leading-[1.3] text-white whitespace-pre-wrap mt-[50px]">
                    {heroData.quote}
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div id="program" className="bg-white text-black py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-teal/20" />
        <section className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div {...fadeInUp} className="mb-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-red mb-4">{programHeader.topTitle}</p>
            <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter mb-4 uppercase">PROGRAM</h2>
            <p className="text-sm md:text-base font-light opacity-60 tracking-wider max-w-xl mx-auto leading-relaxed">
              {programHeader.description}
            </p>
          </motion.div>

          <div className="mb-6 text-center relative pt-2">
            <span className="text-[60px] md:text-[140px] font-sans font-bold tracking-tighter text-black/[0.03] absolute left-1/2 -translate-x-1/2 -top-4 pointer-events-none whitespace-nowrap select-none">
              Hudba
            </span>
            <h3 className="text-2xl font-bold tracking-tight relative z-10">Hudba a koncerty</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10 mb-12 items-start">
            {musicProgram.length === 0 ? (
              <motion.div 
                {...fadeInUp}
                className="col-span-full py-20 px-8 text-center glass-card bg-black/5 border-dashed border-black/10 rounded-3xl"
              >
                <Music size={40} className="mx-auto text-black/10 mb-4" />
                <p className="text-xl font-bold tracking-tight text-black/30 uppercase">
                  Hudební program pro tento rok připravujeme
                </p>
                <p className="text-sm text-black/20 font-bold uppercase tracking-widest mt-2">
                  Sledujte nás pro brzké oznámení interpretů
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {musicProgram.filter((_, idx) => idx % 2 === 0).map((item, i) => {
                    const isExpanded = expandedArtist === item.id;
                    const MusicIcon = (item.icon && COMMUNITY_ICON_MAP[item.icon]) || Music;
                    return (
                      <motion.div 
                        key={item.id}
                        {...fadeInUp}
                        transition={{ ...fadeInUp.transition, delay: (i * 2) * 0.05 }}
                        onClick={() => setExpandedArtist(isExpanded ? null : item.id)}
                        className={`bg-brand-red text-white border border-brand-red/10 rounded-2xl hover:bg-brand-red-dark transition-all duration-300 group cursor-pointer flex flex-col overflow-hidden ${isExpanded ? 'ring-2 ring-brand-teal/50' : ''}`}
                      >
                        {item.imageUrl && (
                          <div className="w-full h-40 overflow-hidden bg-white/5 border-b border-white/10">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" loading="lazy" />
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className={`flex items-center justify-between gap-3 ${isExpanded ? 'mb-4' : 'mb-0'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <MusicIcon size={20} className={`shrink-0 transition-opacity ${isExpanded ? 'opacity-100 text-brand-teal' : 'opacity-30 group-hover:opacity-100'}`} />
                              <h4 className="text-xl font-bold tracking-tight font-sans transition-colors group-hover:text-brand-teal truncate">{item.name}</h4>
                            </div>
                            {isExpanded ? <ChevronUp size={20} className="shrink-0 text-brand-teal" /> : <ChevronDown size={20} className="shrink-0 opacity-50" />}
                          </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="mb-4">
                                <span className="inline-block border border-white/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white/70 shadow-xs">
                                  {item.tag}
                                </span>
                              </div>
                              <p className="text-base opacity-90 leading-relaxed mb-6 font-light">{item.desc}</p>
                              {item.video && (
                                <div className="mb-6 rounded-xl overflow-hidden aspect-video bg-black/20 border border-white/10 shadow-inner">
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${((v) => {
                                      if (!v) return "";
                                      const match = v.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                                      return match ? match[1] : v;
                                    })(item.video)}?rel=0`}
                                    title={`${item.name} video`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-3">
                  {musicProgram.filter((_, idx) => idx % 2 !== 0).map((item, i) => {
                    const isExpanded = expandedArtist === item.id;
                    const MusicIcon = (item.icon && COMMUNITY_ICON_MAP[item.icon]) || Music;
                    return (
                      <motion.div 
                        key={item.id}
                        {...fadeInUp}
                        transition={{ ...fadeInUp.transition, delay: (i * 2 + 1) * 0.05 }}
                        onClick={() => setExpandedArtist(isExpanded ? null : item.id)}
                        className={`bg-brand-red text-white border border-brand-red/10 rounded-2xl hover:bg-brand-red-dark transition-all duration-300 group cursor-pointer flex flex-col overflow-hidden ${isExpanded ? 'ring-2 ring-brand-teal/50' : ''}`}
                      >
                        {item.imageUrl && (
                          <div className="w-full h-40 overflow-hidden bg-white/5 border-b border-white/10">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" loading="lazy" />
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className={`flex items-center justify-between gap-3 ${isExpanded ? 'mb-4' : 'mb-0'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <MusicIcon size={20} className={`shrink-0 transition-opacity ${isExpanded ? 'opacity-100 text-brand-teal' : 'opacity-30 group-hover:opacity-100'}`} />
                              <h4 className="text-xl font-bold tracking-tight font-sans transition-colors group-hover:text-brand-teal truncate">{item.name}</h4>
                            </div>
                            {isExpanded ? <ChevronUp size={20} className="shrink-0 text-brand-teal" /> : <ChevronDown size={20} className="shrink-0 opacity-50" />}
                          </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="mb-4">
                                <span className="inline-block border border-white/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white/70 shadow-xs">
                                  {item.tag}
                                </span>
                              </div>
                              <p className="text-base opacity-90 leading-relaxed mb-6 font-light">{item.desc}</p>
                              {item.video && (
                                <div className="mb-6 rounded-xl overflow-hidden aspect-video bg-black/20 border border-white/10 shadow-inner">
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${((v) => {
                                      if (!v) return "";
                                      const match = v.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                                      return match ? match[1] : v;
                                    })(item.video)}?rel=0`}
                                    title={`${item.name} video`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mb-8 text-center relative pt-2">
            <span className="text-[60px] md:text-[140px] font-sans font-bold tracking-tighter text-black/[0.03] absolute left-1/2 -translate-x-1/2 -top-6 pointer-events-none whitespace-nowrap select-none">
              Talkshow
            </span>
            <h3 className="text-2xl font-sans font-bold tracking-tight relative z-10 text-black">Talkshow a diskuse</h3>
          </div>

          <div className="space-y-6 mb-12">
            {talkshows.length === 0 ? (
              <motion.div 
                {...fadeInUp}
                className="py-20 px-8 text-center glass-card bg-black/5 border-dashed border-black/10 rounded-3xl"
              >
                <MessageSquare size={40} className="mx-auto text-black/10 mb-4" />
                <p className="text-xl font-bold tracking-tight text-black/30 uppercase">
                  Program talkshow připravujeme
                </p>
                <p className="text-sm text-black/20 font-bold uppercase tracking-widest mt-2">
                  Zajímavé hosty a diskuse oznámíme již brzy
                </p>
              </motion.div>
            ) : (
              talkshows.map((item, i) => {
                const TalkIcon = (item.icon && COMMUNITY_ICON_MAP[item.icon]) || MessageSquare;
                return (
                  <div key={item.id} className="bg-[#42A1A1] border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="space-y-8 relative z-10">
                      <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: i * 0.1 }}>
                        {/* Záhlaví talkshow */}
                        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 border-b border-white/10 pb-8">
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0">
                            <TalkIcon size={32} />
                          </div>
                          <div>
                            <h4 className="text-3xl md:text-4xl font-sans font-black tracking-tighter text-white mb-1 leading-none">{item.title}</h4>
                            <p className="text-white/60 font-bold leading-relaxed max-w-2xl text-sm md:text-base">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      
                      {/* Hosté */}
                      {(item.guestsTitle || item.guests?.some(g => g.name || (g as any).desc)) && (
                        <div className="space-y-6 pb-8 border-b border-white/10 mb-8">
                          {item.guestsTitle && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{item.guestsTitle}</p>}
                          <div className="flex flex-wrap gap-y-8 gap-x-12">
                            {item.guests?.map((guest, gi) => (
                              (guest.name || (guest as any).desc) && (
                                <div key={gi} className="group shrink-0 max-w-[200px] flex flex-col items-center text-center">
                                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 bg-white/10 border-2 border-white/20 shrink-0 shadow-lg">
                                    {guest.imageUrl ? (
                                      <img src={guest.imageUrl} alt={guest.name || 'host'} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-white/20">
                                        <Users size={24} />
                                      </div>
                                    )}
                                  </div>
                                  {guest.name && <p className="text-xl font-bold tracking-tight text-white leading-tight">{guest.name}</p>}
                                  {(guest as any).desc && <p className="text-sm text-white/50 font-medium mt-1 leading-snug">{(guest as any).desc}</p>}
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Organizátoři */}
                      {item.organizers?.some(o => o.name || o.role) && (
                        <div className="space-y-6">
                          {item.organizersTitle && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{item.organizersTitle}</p>}
                          <div className="flex flex-wrap gap-6">
                          {item.organizers.map((org, oi) => (
                            (org.name || org.role) && (
                              <div key={oi} className="group shrink-0 max-w-[200px] flex flex-col items-center text-center">
                                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 bg-white/10 border-2 border-white/20 shrink-0 shadow-lg">
                                  {org.imageUrl ? (
                                    <img src={org.imageUrl} alt={org.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                      <Users size={24} />
                                    </div>
                                  )}
                                </div>
                                {org.name && <p className="text-xl font-bold tracking-tight text-white leading-tight">{org.name}</p>}
                                {org.desc && <p className="text-sm text-white/50 font-medium mt-1 leading-snug">{org.desc}</p>}
                                {org.role && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">{org.role}</p>}
                              </div>
                            )
                          ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              );
            })
            )}
          </div>

          <div className="mb-6 text-center relative pt-2">
            <span className="text-[60px] md:text-[140px] font-sans font-bold tracking-tighter text-black/[0.03] absolute left-1/2 -translate-x-1/2 -top-4 pointer-events-none whitespace-nowrap select-none">
              Rodiny
            </span>
            <h3 className="text-2xl font-bold tracking-tight relative z-10">Program pro děti a rodiny</h3>
          </div>

          <div className="space-y-12 mb-12">
            {familyProgram.length === 0 ? (
              <motion.div 
                {...fadeInUp}
                className="py-16 px-8 text-center glass-card bg-black/5 border-dashed border-black/10 rounded-3xl"
              >
                <p className="text-xl font-bold tracking-tight text-black/30 uppercase leading-none">
                  Program pro rodiny připravujeme
                </p>
              </motion.div>
            ) : (
              familyProgram.map((item, i) => {
                const FamilyIcon = (item.icon && COMMUNITY_ICON_MAP[item.icon]) || Star;
                return (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
                    <motion.div 
                      {...fadeInUp}
                      transition={{ delay: i * 0.1 }}
                      className="md:col-span-12 bg-brand-yellow rounded-3xl p-10 md:p-16 shadow-2xl border-4 border-black/5 relative overflow-hidden"
                    >
                      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
                        <div className="md:col-span-1 flex flex-col items-start text-left">
                          <div className="inline-flex items-center gap-2 bg-brand-red px-5 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-[0.2em] mb-8 shadow-lg">
                            <FamilyIcon size={16} />
                            <span>{item.tag}</span>
                          </div>
                        <h4 className="text-4xl md:text-5xl font-sans font-black tracking-tighter mb-6 text-black leading-none">
                          {item.title}
                        </h4>
                        <p className="text-black/80 text-lg leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="md:col-span-2 text-left">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                          {item.activities?.map((act, idx) => {
                            const IconComp = FAMILY_ICON_MAP[act.icon] || Sparkles;
                            return (
                              <div key={idx} className="flex items-center gap-3 p-5 bg-white/40 backdrop-blur-md rounded-2xl border border-black/5 hover:bg-white/60 hover:scale-105 transition-all duration-300 shadow-sm">
                                <IconComp size={20} className="text-brand-red shrink-0" />
                                <span className="text-sm font-bold uppercase tracking-tight text-black leading-tight">{act.name}</span>
                              </div>
                            );
                          })}
                        </div>

                        {item.mainPoint && (
                          <div className="bg-black/5 border border-black/10 rounded-[32px] p-8 mt-4 flex items-center gap-6 group hover:scale-[1.01] transition-transform duration-500">
                             <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-red rounded-full flex items-center justify-center text-white shrink-0 shadow-xl">
                               <Clock size={32} />
                             </div>
                             <div className="text-left">
                               <div className="mb-1">
                                 <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-brand-red">HLAVNÍ BOD PROGRAMU</p>
                               </div>
                               <h4 className="text-2xl md:text-4xl font-sans font-black tracking-tighter text-black leading-tight leading-none mb-1">
                                 {item.mainPoint}
                               </h4>
                               {item.mainPointTime && (
                                 <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-brand-red">{item.mainPointTime}</p>
                               )}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })
            )}
          </div>

          <div className="mb-6 text-center relative pt-2">
            <span className="text-[60px] md:text-[140px] font-sans font-bold tracking-tighter text-black/[0.03] absolute left-1/2 -translate-x-1/2 -top-4 pointer-events-none whitespace-nowrap select-none">
              Komunita
            </span>
            <h3 className="text-2xl font-bold tracking-tight relative z-10">Prezentace organizací a zóna klidu</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
            {/* Left Block: Organizace */}
            <motion.div 
               {...fadeInUp}
               className="md:col-span-8 bg-[#42A1A1] rounded-[40px] p-8 md:p-10 shadow-2xl overflow-hidden relative border border-white/10 h-full"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="space-y-8 relative z-10 h-full flex flex-col">
                {communitySections.filter(s => {
                  const t = s.title?.trim().toLowerCase() || '';
                  const n = s.name?.trim().toLowerCase() || '';
                  const d = s.description?.toLowerCase() || '';
                  const hasItems = s.items && s.items.length > 0;
                  return t === 'organizace' || t === 'velká sekce' || n.includes('organizace') || d.includes('neziskovky') || (hasItems && !s.tag);
                }).map((section) => {
                  const IconComponent = (section.icon && COMMUNITY_ICON_MAP[section.icon]) ? COMMUNITY_ICON_MAP[section.icon] : Heart;
                  
                  return (
                    <div key={section.id} className="space-y-8 group flex-grow">
                      <div className="flex items-start gap-5">
                        <div className="p-3 bg-white/10 rounded-2xl text-white shadow-inner flex-shrink-0">
                          <IconComponent size={28} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-3xl font-sans font-bold tracking-tighter text-white">
                            {section.name || 'Prezentace organizací'}
                          </h4>
                          <p className="text-white/70 font-light leading-snug text-left max-w-xl text-base">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(section.items || []).map((item, i) => {
                          const itemContent = (
                            <>
                              {item.image && (
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white shrink-0 p-1 flex items-center justify-center">
                                  <img src={item.image} className="w-full h-full object-contain" alt={item.name} referrerPolicy="no-referrer" loading="lazy" />
                                </div>
                              )}
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-lg text-white tracking-tight">{item.name}</span>
                                  {item.link && <ExternalLink size={12} className="text-brand-teal shrink-0" />}
                                </div>
                                <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest opacity-60 group-hover/item:opacity-100 transition-opacity">
                                  {item.description}
                                </p>
                              </div>
                            </>
                          );

                          if (item.link) {
                            const validLink = item.link.startsWith('http') ? item.link : `https://${item.link}`;
                            return (
                              <a 
                                key={i} 
                                href={validLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 bg-black/10 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group/item flex items-center gap-4 cursor-pointer"
                              >
                                {itemContent}
                              </a>
                            );
                          }

                          return (
                            <div key={i} className="p-4 bg-black/10 rounded-2xl border border-white/5 hover:bg-black/20 transition-all text-left group/item flex items-center gap-4">
                              {itemContent}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {communitySections.filter(s => {
                  const t = s.title?.trim().toLowerCase() || '';
                  const n = s.name?.trim().toLowerCase() || '';
                  const d = s.description?.toLowerCase() || '';
                  const hasItems = s.items && s.items.length > 0;
                  return t === 'organizace' || t === 'velká sekce' || n.includes('organizace') || d.includes('neziskovky') || (hasItems && !s.tag);
                }).length === 0 && (
                  <div className="flex-grow flex items-center justify-center">
                    <div className="py-12 px-6 text-center border-2 border-dashed border-white/10 rounded-3xl opacity-30 w-full">
                      <p className="text-xs font-bold uppercase tracking-widest text-white">Sekce Organizace se připravuje</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Block: Zóna klidu */}
            <motion.div 
               {...fadeInUp}
               className="md:col-span-4 bg-[#3E9292] rounded-[40px] p-8 md:p-10 shadow-2xl overflow-hidden relative border border-white/10 h-full"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="space-y-8 relative z-10 h-full flex flex-col">
                {communitySections.filter(s => {
                  const t = s.title?.trim().toLowerCase() || '';
                  const n = s.name?.trim().toLowerCase() || '';
                  const d = s.description?.toLowerCase() || '';
                  const hasTag = !!s.tag;
                  return t.includes('klidu') || t === 'malá sekce' || t === 'malá' || n.includes('klidu') || d.includes('klidu') || d.includes('ztišení') || (hasTag && (!s.items || s.items.length === 0));
                }).map((section) => {
                  const IconComponent = (section.icon && COMMUNITY_ICON_MAP[section.icon]) ? COMMUNITY_ICON_MAP[section.icon] : Pause;
                  
                  return (
                    <div key={section.id} className="space-y-8 group flex-grow h-full flex flex-col">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl text-white shadow-inner">
                          <IconComponent size={24} />
                        </div>
                        <h4 className="text-2xl font-sans font-bold tracking-tighter text-white">
                          {section.name || 'Zóna klidu'}
                        </h4>
                      </div>
                      
                      <p className="text-white/70 font-light leading-relaxed text-left text-base">
                        {section.description}
                      </p>

                      {section.tag && (
                        <div className="p-6 bg-white/5 rounded-[28px] border border-white/10 flex items-center justify-center text-center mt-auto">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200 opacity-80 decoration-brand-yellow/50 decoration-2 underline-offset-4">
                            {section.tag}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {communitySections.filter(s => {
                  const t = s.title?.trim().toLowerCase() || '';
                  const n = s.name?.trim().toLowerCase() || '';
                  const d = s.description?.toLowerCase() || '';
                  const hasTag = !!s.tag;
                  return t.includes('klidu') || t === 'malá sekce' || t === 'malá' || n.includes('klidu') || d.includes('klidu') || d.includes('ztišení') || (hasTag && (!s.items || s.items.length === 0));
                }).length === 0 && (
                  <div className="flex-grow flex items-center justify-center">
                    <div className="py-12 px-6 text-center border-2 border-dashed border-white/10 rounded-3xl opacity-30 w-full">
                      <p className="text-xs font-bold uppercase tracking-widest text-white">Sekce Malá sekce se připravuje</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <section id="o-festivalu" className="bg-brand-red text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-black/5 -skew-x-12 transform translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 shadow-[0_0_100px_rgba(255,255,255,0.1)]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50 mb-4">{aboutHeader.subtitle}</p>
            <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter mb-8 uppercase leading-none">O festivalu</h2>
          </motion.div>

          <div className="flex flex-col gap-8 relative z-10">
            {aboutSections.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl opacity-30 w-full">
                <p className="text-xs font-bold uppercase tracking-widest text-white">Informace o festivalu připravujeme</p>
              </div>
            ) : (
              <>
                {aboutSections.map((section, idx) => {
                  const isLarge = section.size === 'large';
                  const tagColorClass = isLarge ? 'text-brand-teal' : 'text-brand-yellow';
                  const barColorClass = isLarge ? 'bg-brand-teal' : 'bg-brand-yellow';
                  const bgClass = isLarge ? 'bg-[#4a0a0a]' : (idx % 2 === 0 ? 'bg-black/20' : 'bg-black/40');

                  return (
                    <motion.div 
                      key={section.id}
                      whileHover={{ y: -5 }}
                      className={`${bgClass} ${isLarge ? 'p-12 md:p-20' : 'p-10 md:p-14'} space-y-8 relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/5 transition-all duration-500`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-0.5 w-8 ${barColorClass}`} />
                        <p className={`text-xs font-black uppercase tracking-[0.4em] ${tagColorClass}`}>{section.tag}</p>
                      </div>
                      <p className="text-2xl md:text-3xl font-sans font-bold leading-tight tracking-tighter whitespace-pre-wrap">
                        {section.title}
                      </p>
                      <p className="text-lg text-white/80 leading-relaxed font-light whitespace-pre-wrap max-w-5xl">
                        {section.description}
                      </p>

                      {section.items && section.items.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                          {section.items.map((item, i) => (
                            <div key={i} className="space-y-2">
                              {item.link ? (
                                <a 
                                  href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/item flex gap-6 text-left items-start"
                                >
                                  {item.image && (
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-white group-hover/item:border-brand-teal transition-colors shrink-0 p-2 flex items-center justify-center shadow-md">
                                      <img src={item.image} className="w-full h-full object-contain transition-all duration-500" alt={item.name} referrerPolicy="no-referrer" loading="lazy" />
                                    </div>
                                  )}
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center justify-between w-full gap-2">
                                      <span className="text-xl font-bold text-white group-hover/item:text-brand-teal transition-colors tracking-tight">{item.name}</span>
                                      <ExternalLink size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-brand-teal shrink-0" />
                                    </div>
                                    {item.description && <p className="text-sm text-white/70 leading-relaxed font-light whitespace-pre-wrap">{item.description}</p>}
                                  </div>
                                </a>
                              ) : (
                                <div className="flex gap-6 text-left items-start">
                                  {item.image && (
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-white shrink-0 p-2 flex items-center justify-center shadow-md">
                                      <img src={item.image} className="w-full h-full object-contain transition-all duration-500" alt={item.name} referrerPolicy="no-referrer" loading="lazy" />
                                    </div>
                                  )}
                                  <div className="space-y-2 flex-1">
                                    <span className="text-xl font-bold text-white tracking-tight">{item.name}</span>
                                    {item.description && <p className="text-sm text-white/70 leading-relaxed font-light whitespace-pre-wrap">{item.description}</p>}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </section>

      <section id="info" className="bg-white text-black py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div {...fadeInUp} className="mb-12 text-center text-black">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-red mb-4">{infoHeader.topTitle}</p>
            <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter mb-4 uppercase">PRAKTICKÉ INFO</h2>
            <p className="text-sm md:text-base font-light opacity-60 tracking-wider max-w-xl mx-auto leading-relaxed">
              {infoHeader.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {practicalInfo.length === 0 ? (
               <div className="col-span-full py-10 text-center text-black/20 font-bold uppercase tracking-widest italic">
                 Informace připravujeme...
               </div>
            ) : (
              practicalInfo.map((item, idx) => (
                  <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-8 rounded-2xl flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-300 min-h-[160px] justify-center shadow-[0_0_50px_rgba(0,0,0,0.08)] hover:shadow-[0_0_60px_rgba(0,0,0,0.12)] border border-black/5"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red mb-4 block">
                    {item.label}
                  </span>
                  <p className="text-xl md:text-2xl font-bold tracking-tight text-black leading-tight">
                    {item.text}
                  </p>
                  <div className="h-px w-10 bg-black/10 my-4 transition-colors group-hover:bg-brand-teal" />
                  <p className="text-xs text-black/40 font-bold uppercase tracking-widest leading-relaxed">
                    {item.sub}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <footer id="kontakt" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-12 text-left">
            <div className="space-y-8">
              <div className="inline-block bg-brand-yellow px-6 py-2 rounded-lg transform -skew-x-6">
                <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tighter text-black uppercase transform skew-x-6">BUĎTE U TOHO.</h2>
              </div>
              <div className="text-lg text-white max-w-sm leading-relaxed font-medium space-y-4">
                {(!contactInfo.welcomeText || contactInfo.welcomeText.trim() === '') ? (
                  <p className="italic text-white/50">Uvítací text se připravuje...</p>
                ) : (
                  contactInfo.welcomeText.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))
                )}
                {contactInfo.tagline && contactInfo.tagline.trim() !== '' && (
                  <p className="text-brand-teal font-black pt-2 uppercase">{contactInfo.tagline}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-10 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
                <div className="flex items-center gap-4">
                  <Heart size={20} className="text-brand-red animate-pulse" />
                  <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 flex flex-col gap-3">
                    <Link to="/gdpr" className="text-white/80 hover:text-brand-teal transition-all border-b border-white/20 hover:border-brand-teal/50 self-start pb-0.5 tracking-widest">
                      Ochrana soukromí
                    </Link>
                    <p>{globalSettings.copyright}</p>
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                Web vytvořila digitální agentura <a href="https://digifire.cz" target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:text-white transition-colors">Digifire.cz</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold tracking-tight mb-8">Pošlete nám zprávu</h3>
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-brand-teal text-black p-10 rounded-2xl text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mx-auto text-black">
                      <Sparkles size={32} />
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tighter">Zpráva odeslána!</h4>
                    <p className="font-medium">Děkujeme za váš zájem. Brzy se vám ozveme zpět.</p>
                  </motion.div>
                ) : (
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleContactSubmit}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Jméno *</label>
                      <input 
                        required
                        type="text" 
                        
                        value={contactForm.name}
                        onChange={e => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-teal/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">E-mail *</label>
                      <input 
                        required
                        type="email" 
                        
                        value={contactForm.email}
                        onChange={e => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-teal/50 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Zpráva *</label>
                      <textarea 
                        required
                        rows={4}
                        
                        value={contactForm.message}
                        onChange={e => setContactForm({...contactForm, message: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-teal/50 transition-colors resize-none"
                      />
                    </div>
                    <div className="md:col-span-2 pt-2">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-10 py-4 bg-brand-teal text-black font-black uppercase tracking-widest rounded-xl hover:bg-brand-teal-light hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Odesílám...' : 'Odeslat dotaz'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                  <a href={contactInfo.email ? `mailto:${contactInfo.email}` : '#'} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-brand-teal group-hover:text-black transition-all shadow-lg">
                      <Mail size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Napište nám</span>
                      <span className="text-base font-medium tracking-tight text-white group-hover:text-brand-teal transition-colors">
                        {contactInfo.email || "E-mail připravujeme"}
                      </span>
                    </div>
                  </a>
                  <a href={contactInfo.phone ? `tel:${contactInfo.phone.replace(/\s/g, '')}` : '#'} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-brand-teal group-hover:text-black transition-all shadow-lg">
                      <Phone size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Zavolejte nám</span>
                      <span className="text-base font-medium tracking-tight text-white group-hover:text-brand-teal transition-colors">
                        {contactInfo.phone || "Telefon připravujeme"}
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </motion.div>
    </>
  );
}
