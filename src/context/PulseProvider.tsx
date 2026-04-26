import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConductorStore } from '../stores/conductorStore';
import { updatePresence, subscribeToActiveUsers } from '../lib/presence';

interface PulseContextType {
  activeUsers: number;
  focusScoreIntensity: number;
}

const PulseContext = createContext<PulseContextType>({ activeUsers: 0, focusScoreIntensity: 1 });

export const PulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUsers, setActiveUsers] = useState(0);
  const uid = useConductorStore((state) => state.uid);

  useEffect(() => {
    if (!uid) return;

    updatePresence(uid, 'online');

    const unsubscribe = subscribeToActiveUsers((count) => {
      setActiveUsers(count);
    });

    const handleBeforeUnload = () => updatePresence(uid, 'offline');
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      updatePresence(uid, 'offline');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [uid]);

  const focusScoreIntensity = 0.5 + Math.min(activeUsers * 0.1, 1.5);

  return (
    <PulseContext.Provider value={{ activeUsers, focusScoreIntensity }}>
      {children}
    </PulseContext.Provider>
  );
};

export const usePulse = () => useContext(PulseContext);
