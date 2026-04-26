import React, { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { collection, onSnapshot, type DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useConnections, useSocial } from '../hooks/useSocial';
import { useConductorStore } from '../stores/conductorStore';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Scholar extends DocumentData {
  id: string;
  displayName: string;
  bio: string;
}

const Scholars: React.FC = () => {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { uid } = useConductorStore();
  const { connections } = useConnections(uid);
  const { follow, requestPartner, removeConnection } = useSocial();

  useEffect(() => {
    const q = collection(db, 'scholars');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Scholar))
        .filter(s => s.id !== uid);
      setScholars(data);
    });
    return () => unsubscribe();
  }, [uid]);

  const getConnectionStatus = (targetId: string) => {
    return connections.find(c => c.participants.includes(targetId));
  };

  const filteredScholars = scholars.filter(s => 
    s.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-void text-slate-200">
      <Nav />
      <main className="pt-32 max-w-7xl mx-auto px-6 pb-24">
        <header className="mb-12">
          <h1 className="text-5xl font-heading font-bold text-white mb-6">SCHOLARS</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search scholars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-accent"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholars.map(scholar => {
            const connection = getConnectionStatus(scholar.id);
            return (
              <div key={scholar.id} className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
                <h3 className="text-xl font-semibold text-white">{scholar.displayName}</h3>
                <p className="text-slate-400 text-sm line-clamp-3">{scholar.bio || 'No bio provided.'}</p>
                
                <div className="mt-auto flex flex-wrap gap-2">
                  {!connection ? (
                    <>
                      <button onClick={() => follow(scholar.id)} className="px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-semibold hover:bg-accent/30">
                        Follow
                      </button>
                      <button onClick={() => requestPartner(scholar.id, 'study_partner')} className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20">
                        Study Partner
                      </button>
                      <Link to={`/profile/${scholar.id}`} className="px-4 py-2 rounded-full border border-white/10 text-white text-sm font-semibold hover:bg-white/5">
                        Scout
                      </Link>
                    </>
                  ) : (
                    <button 
                      onClick={() => removeConnection(connection.id)} 
                      className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30"
                    >
                      {connection.type === 'follower' ? 'Unfollow' : `Remove ${connection.type.replace('_', ' ')}`}
                    </button>
                  )}
                  {connection && connection.status === 'pending' && (
                    <span className="px-4 py-2 text-slate-500 text-sm">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Scholars;
