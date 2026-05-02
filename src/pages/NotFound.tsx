import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-900">
    <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">404</h1>
    <p className="text-xl font-bold uppercase tracking-widest text-slate-400">Stránka nebyla nalezena</p>
    <Link to="/" className="mt-8 px-6 py-3 bg-brand-teal text-black rounded-xl font-black uppercase tracking-widest hover:bg-brand-teal-light transition-all">
      Zpět na úvod
    </Link>
  </div>
);

export default NotFound;
