import React, { useState, useEffect } from 'react';
import TheVeil from '../components/TheVeil';

const VeilTest: React.FC = () => {
  const [userLevel, setUserLevel] = useState<number>(1);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  const secretText = "This is a secret insight about the nature of focus.";

  return (
    <div className="p-12 max-w-2xl mx-auto space-y-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setUserLevel(userLevel === 1 ? 2 : 1)}
          className="px-4 py-2 bg-slate-800 text-white rounded-[2px] font-body text-sm uppercase tracking-wider transition-opacity hover:opacity-90"
        >
          Toggle Level: {userLevel === 1 ? 'Initiate (1)' : 'Archivist (2)'}
        </button>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-[2px] font-body text-sm uppercase tracking-wider transition-opacity hover:opacity-80"
        >
          Toggle Theme: {isDark ? 'Dark' : 'Light'}
        </button>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-heading uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
            1. Standard Secret
          </h2>
          <div className="bg-white dark:bg-black/20 p-6 border border-slate-200 dark:border-slate-800">
            <p className="font-body text-slate-800 dark:text-slate-200 leading-relaxed">
              In the heart of the conductor, we find the core principle: <TheVeil userLevel={userLevel} children={userLevel >= 2 ? secretText : undefined} />
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-heading uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
            2. Undefined Children
          </h2>
          <div className="bg-white dark:bg-black/20 p-6 border border-slate-200 dark:border-slate-800">
            <p className="font-body text-slate-800 dark:text-slate-200 leading-relaxed">
              This entry has no redacted content provided: <TheVeil userLevel={userLevel} children={undefined} />
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-heading uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
            3. Level 2 with Content
          </h2>
          <div className="bg-white dark:bg-black/20 p-6 border border-slate-200 dark:border-slate-800">
            <p className="font-body text-slate-800 dark:text-slate-200 leading-relaxed">
              Archivist View: <TheVeil userLevel={2} children={secretText} />
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-heading uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
            4. Empty String
          </h2>
          <div className="bg-white dark:bg-black/20 p-6 border border-slate-200 dark:border-slate-800">
            <p className="font-body text-slate-800 dark:text-slate-200 leading-relaxed">
              Empty content: <TheVeil userLevel={userLevel} children="" />
            </p>
          </div>
        </section>
      </div>

      <div className="mt-12 text-xs font-mono text-slate-400 uppercase tracking-tighter text-center">
        NorthStar V2.0 // The Veil Verification Module
      </div>
    </div>
  );
};

export default VeilTest;
