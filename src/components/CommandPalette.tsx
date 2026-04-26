import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Book, FileText, Home, User, Shield, X, Terminal, Cpu } from 'lucide-react';
import { useConductorStore } from '../stores/conductorStore';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { scholarGrade, level, displayName } = useConductorStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    const toggle = () => setOpen((prev) => !prev);
    document.addEventListener('keydown', down);
    window.addEventListener('toggle-command-palette', toggle);

    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('toggle-command-palette', toggle);
    };
  }, []);

  const commands = [
    { id: 'home', title: 'Central Node', sub: 'Home_Return', icon: Home, path: '/' },
    { id: 'obs', title: 'The Observatory', sub: 'Spatial_Map_Discovery', icon: Map, path: '/observatory' },
    { id: 'arc', title: 'The Archive', sub: 'Verified_Research_Log', icon: Book, path: '/archive' },
    { id: 'ins', title: 'Sacred Insights', sub: 'Multimedia_Tutorial_Library', icon: FileText, path: '/sacred-insights' },
    { id: 'dash', title: 'Scholar Dashboard', sub: 'Personal_Intel_Access', icon: User, path: '/dashboard' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase()) || 
    cmd.sub.toLowerCase().includes(search.toLowerCase())
  );

  const runCommand = (path: string) => {
    setOpen(false);
    setSearch('');
    navigate(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-between py-20 px-6 overflow-hidden"
        >
          {/* Intense Backdrop */}
          <div className="absolute inset-0 bg-[#05040A]/98 backdrop-blur-[40px] z-0" onClick={() => setOpen(false)} />
          
          {/* Scanning Line Decor */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(57,255,20,0.1)_1px,transparent_1px)] bg-[size:100%_4px] z-0" />

          {/* 1. THE HERO IDENTITY (TOP) */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="relative z-10 w-full max-w-6xl text-center space-y-8"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-2 border-[#39FF14]/20 rounded-full flex items-center justify-center p-4 relative"
              >
                <div className="absolute inset-0 rounded-full border-t-2 border-[#39FF14] animate-spin" style={{ animationDuration: '3s' }} />
                <Shield className="text-[#39FF14] w-full h-full" />
              </motion.div>
              
              <div className="space-y-2">
                <span className="text-[12px] font-mono font-bold tracking-[0.6em] text-[#39FF14]/40 uppercase">
                  Scholar_Identity_Protocol // Active
                </span>
                <h2 
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                  className="text-8xl md:text-9xl lg:text-[12rem] text-white italic tracking-tighter leading-none"
                >
                  {displayName || 'Anonymous'}
                </h2>
                <div className="flex items-center justify-center gap-10 mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl md:text-5xl font-heading font-black text-[#39FF14] tracking-widest uppercase italic">
                      {scholarGrade}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 tracking-[0.3em] mt-1">DESIGNATION_LEVEL</span>
                  </div>
                  <div className="h-16 w-[1px] bg-[#39FF14]/20 rotate-12" />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-mono text-white/90 uppercase tracking-tighter">
                      LVL_{level}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 tracking-[0.3em] mt-1">ACCESS_CLEARANCE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. THE SEARCH TERMINAL (CENTER-BOTTOM) */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 w-full max-w-3xl"
          >
            <div className="bg-[#1A0B2E]/50 border border-[#39FF14]/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(57,255,20,0.1)] liquid-glass">
              <div className="flex items-center gap-4 px-6 border-b border-[#39FF14]/10 bg-white/5">
                <Terminal size={20} className="text-[#39FF14] opacity-50" />
                <input 
                  autoFocus
                  placeholder="Initiate Command Sequence..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-white placeholder:text-white/10 outline-none py-8 text-2xl font-heading"
                />
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                {filteredCommands.length === 0 ? (
                  <div className="py-10 text-center font-mono text-xs text-slate-600 tracking-widest">[DATA_QUERY_FAILED]</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredCommands.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => runCommand(cmd.path)}
                        className="flex items-center gap-4 p-4 text-left bg-white/5 hover:bg-[#39FF14]/10 rounded-2xl transition-all border border-white/5 hover:border-[#39FF14]/30 group"
                      >
                        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#39FF14]/20 text-[#39FF14] transition-colors">
                          <cmd.icon size={20} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-white uppercase tracking-wider truncate">{cmd.title}</span>
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest truncate">{cmd.sub}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="px-6 py-4 flex items-center justify-between bg-black/40 text-[9px] font-mono text-slate-600 uppercase tracking-[0.4em]">
                <div className="flex items-center gap-3">
                  <Cpu size={10} className="text-[#39FF14]" />
                  SYNC_STATE: NOMINAL
                </div>
                <div className="flex items-center gap-4">
                   <span>SECURE_CONNECTION_STABLE</span>
                   <span className="text-white/20">|</span>
                   <span>ESC_TO_ABORT</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Proof Signature (BOTTOM) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="relative z-10 text-[10px] font-mono text-white tracking-[0.8em] uppercase italic"
          >
            Authenticated By North Star Protocol V2.0
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
