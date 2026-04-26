import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useConductorStore } from '../stores/conductorStore';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Sigil } from './Sigil';
import { Search, Menu } from 'lucide-react';
import { OrbitalMenu } from './OrbitalMenu';

const Nav: React.FC = () => {
  const { uid, level, scholarGrade } = useConductorStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleTogglePalette = () => {
    window.dispatchEvent(new CustomEvent('toggle-command-palette'));
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="glass rounded-[2px] px-6 py-3 flex items-center justify-between border border-white/10 shadow-2xl">
        <div className="flex items-center gap-8">
          <Link to="/" className="no-liquid group flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]">
                <defs>
                  <linearGradient id="navVioletMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#2BDEAC" />
                  </linearGradient>
                </defs>
                <path d="M24 4 C24 4 26 22 44 24 C44 24 26 26 24 44 C24 44 22 26 4 24 C4 24 22 22 24 4 Z" fill="url(#navVioletMintGrad)" />
                <circle cx="24" cy="24" r="6" fill="#2BDEAC" />
                <circle cx="24" cy="24" r="2" fill="white" opacity="0.9" />
              </svg>
            </div>
            <span className="font-heading text-xl tracking-tight text-white group-hover:text-mint transition-colors">
              NorthStar
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <Link to="/scholars" className="liquid-glass px-4 py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-widest text-slate-300 transition-all">
              Find Scholars
            </Link>
            <Link to="/archive" className="liquid-glass px-4 py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-widest text-slate-300 transition-all">
              Archive
            </Link>
            <Link to="/sacred-insights" className="liquid-glass px-4 py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-widest text-slate-300 transition-all">
              Insights
            </Link>
            <Link to="/observatory" className="liquid-glass px-4 py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-widest text-slate-300 transition-all">
              Observatory
            </Link>
            {uid && (
              <>
                <Link to="/messaging" className="liquid-glass px-4 py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-widest text-slate-300 transition-all">
                  Messages
                </Link>
                <Link to="/dashboard" className="liquid-glass px-4 py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-widest text-slate-300 transition-all">
                  Dashboard
                </Link>
              </>
            )}
            <button 
              onClick={handleTogglePalette}
              className="liquid-glass p-2 rounded-[2px] text-slate-400 hover:text-[#39FF14] transition-all"
              title="Neural Link (Ctrl+K)"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {uid ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] uppercase tracking-widest text-mint font-bold leading-none">
                  {scholarGrade}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Lvl.{level}
                </span>
              </div>
              <Sigil 
                level={level || 1} 
                experiments={10} 
                onClick={handleTogglePalette}
              />
              <button
                onClick={handleSignOut}
                className="hidden md:block liquid-glass px-4 py-1.5 rounded-[2px] text-[10px] font-bold uppercase tracking-widest text-white/70"
              >
                Exit
              </button>
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                className="p-2 rounded-[2px] bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/signin"
                className="px-4 py-1.5 rounded-[2px] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-[2px] bg-violet-green text-white text-xs font-bold shadow-lg shadow-accent/20"
              >
                Initiate
              </Link>
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                className="p-2 rounded-[2px] bg-white/5 text-slate-400 hover:text-white transition-colors ml-2"
              >
                <Menu size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      <OrbitalMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onSignOut={handleSignOut}
        isAuthenticated={!!uid}
      />
    </nav>
  );
};

export default Nav;
