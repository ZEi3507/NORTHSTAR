import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useConductorStore } from '../stores/conductorStore';
import { useParams } from 'react-router-dom';
import { useConnections } from '../hooks/useSocial';
import Nav from '../components/Nav';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { uid } = useConductorStore();
  const targetId = id || uid;
  const [scholar, setScholar] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const { connections } = useConnections(targetId);

  useEffect(() => {
    if (!targetId) return;
    const fetchScholar = async () => {
      const snap = await getDoc(doc(db, 'scholars', targetId));
      if (snap.exists()) {
        const data = snap.data();
        setScholar(data);
        setBio(data.bio || '');
        setDisplayName(data.displayName || '');
      }
    };
    fetchScholar();
  }, [targetId]);

  const saveProfile = async () => {
    if (!targetId) return;
    await updateDoc(doc(db, 'scholars', targetId), { bio, displayName });
    setIsEditing(false);
  };

  const getStats = () => {
    const followers = connections.filter(c => c.type === 'follower' && c.toId === targetId).length;
    const following = connections.filter(c => c.type === 'follower' && c.fromId === targetId).length;
    const partners = connections.filter(c => c.type.includes('partner')).length;
    return { followers, following, partners };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-void text-slate-200 selection:bg-accent/30">
      <Nav />
      <div className="pt-32 px-6 max-w-2xl mx-auto">
        <div className="glass-card p-10 border border-white/10 rounded-[2px] relative overflow-hidden bg-void/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-mint"></div>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold border border-white/10">
              {displayName?.[0] || 'S'}
            </div>
            {isEditing ? (
              <input 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                className="bg-transparent border-b border-mint text-2xl font-bold text-white outline-none w-full"
              />
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-white">{displayName || 'Anonymous Scholar'}</h1>
                <p className="text-mint uppercase tracking-widest text-xs font-bold">{scholar?.scholarGrade || 'Initiate'}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-8 mb-8 border-y border-white/10 py-4">
            <div className="text-center">
              <div className="font-bold text-lg text-white">{stats.followers}</div>
              <div className="text-xs text-slate-500 uppercase">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-white">{stats.following}</div>
              <div className="text-xs text-slate-500 uppercase">Following</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-white">{stats.partners}</div>
              <div className="text-xs text-slate-500 uppercase">Partners</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-slate-500 uppercase tracking-widest text-xs font-bold">Biography</h3>
            {isEditing ? (
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                className="w-full bg-[#1A1918] border border-white/10 p-4 rounded-[2px] h-32 focus:border-mint outline-none"
              />
            ) : (
              <p className="text-slate-300 leading-relaxed min-h-[5rem]">{bio || 'No bio set.'}</p>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            {(!id || id === uid) && (
              isEditing ? (
                <button onClick={saveProfile} className="liquid-glass px-8 py-3 rounded-[2px] bg-mint text-black font-bold">Save Changes</button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="liquid-glass px-8 py-3 rounded-[2px] border border-white/20 hover:bg-white/5">Edit Profile</button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
