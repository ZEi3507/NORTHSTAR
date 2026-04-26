import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, LogOut, Users, BookOpen, MessageSquare, LayoutDashboard, Telescope, Sparkles, UserCircle } from 'lucide-react';

interface OrbitalMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  isAuthenticated: boolean;
}

export const OrbitalMenu: React.FC<OrbitalMenuProps> = ({ isOpen, onClose, onSignOut, isAuthenticated }) => {
  const menuLinks = useMemo(() => [
    { label: 'Find Scholars', path: '/scholars', icon: Users, public: true },
    { label: 'Archive', path: '/archive', icon: BookOpen, public: true },
    { label: 'Insights', path: '/sacred-insights', icon: Sparkles, public: true },
    { label: 'Observatory', path: '/observatory', icon: Telescope, public: true },
    { label: 'Messages', path: '/messaging', icon: MessageSquare, public: false },

    { label: 'Profile', path: '/profile', icon: UserCircle, public: false },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, public: false },

  ], []);

  const filteredLinks = useMemo(() => 
    menuLinks.filter(link => link.public || isAuthenticated),
    [menuLinks, isAuthenticated]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-[80%] max-w-sm bg-[#0F0E0D] border-l border-white/10 p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-heading text-2xl tracking-tight text-white">
                NorthStar
              </span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 rounded-[2px] bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col gap-6">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className="flex items-center gap-4 text-lg font-medium text-slate-300 hover:text-mint transition-colors group"
                >
                  <div className="p-2 rounded-[2px] bg-white/5 group-hover:bg-mint/10 group-hover:text-mint transition-colors">
                    <link.icon size={20} />
                  </div>
                  {link.label}
                </Link>
              ))}
            </nav>

            {isAuthenticated && (
              <div className="absolute bottom-8 left-8 right-8">
                <button
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="w-full liquid-glass flex items-center justify-center gap-3 px-6 py-4 rounded-[2px] bg-white/5 text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/10"
                >
                  <LogOut size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs">
                    Sign Out
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
