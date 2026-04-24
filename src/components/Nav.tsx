import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useConductorStore } from '../stores/conductorStore';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Nav: React.FC = () => {
  const uid = useConductorStore((s) => s.uid);
  const scholarGrade = useConductorStore((s) => s.scholarGrade);
  const level = useConductorStore((s) => s.level);
  const clearConductor = useConductorStore((s) => s.clearConductor);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    clearConductor();
    navigate('/signin');
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between border border-white/10 shadow-2xl">
        <div className="flex items-center gap-8">
          <Link to="/" className="no-liquid group flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]">
                <defs>
                  <linearGradient id="navVioletMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#7C3AED" />
                    <stop offset="100%" stop-color="#2BDEAC" />
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

          <div className="hidden md:flex items-center gap-6">
            <Link to="/archive" className="px-3 py-1 rounded-full text-sm font-medium text-slate-300 hover:text-white transition-colors">
              The Archive
            </Link>
            {uid && (
              <Link to="/dashboard" className="px-3 py-1 rounded-full text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
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
              <button
                onClick={handleSignOut}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold"
              >
                Exit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/signin"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-full bg-violet-green text-white text-xs font-bold shadow-lg shadow-accent/20"
              >
                Initiate
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
