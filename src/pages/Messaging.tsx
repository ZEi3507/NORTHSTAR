import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useConductorStore } from '../stores/conductorStore';
import { useConnections } from '../hooks/useSocial';
import Nav from '../components/Nav';

const Messaging: React.FC = () => {
  const { uid } = useConductorStore();
  const { connections } = useConnections(uid);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    if (!uid) return;
    const fetchContacts = async () => {
      const contactIds = connections.map(c => c.participants.find(p => p !== uid)).filter(Boolean) as string[];
      if (contactIds.length === 0) return;
      const contactDocs = await Promise.all(contactIds.map(id => getDoc(doc(db, 'scholars', id))));
      setContacts(contactDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })));
    };
    fetchContacts();
  }, [connections, uid]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', uid));
    return onSnapshot(q, (snapshot) => {
      setConversations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [uid]);

  useEffect(() => {
    if (!activeConv) return;
    const q = query(collection(db, 'conversations', activeConv, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [activeConv]);

  const send = async () => {
    if (!activeConv || !newMessage.trim()) return;
    await addDoc(collection(db, 'conversations', activeConv, 'messages'), {
      senderId: uid,
      content: newMessage,
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0F0E0D] text-slate-200 flex flex-col">
      <Nav />
      <div className="flex-1 pt-24 px-6 flex gap-4 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)] pb-8">
        {/* Sidebar */}
        <div className="w-1/3 glass-card border border-white/10 rounded-[2px] p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h2 className="text-mint font-bold uppercase text-xs tracking-widest mb-4">Contacts</h2>
            <div className="flex flex-col gap-2">
              {contacts.map(c => (
                <div key={c.id} className="p-3 bg-white/5 rounded-[2px] text-sm text-slate-300">
                  {c.displayName}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-mint font-bold uppercase text-xs tracking-widest mb-4 mt-4">Active Conversations</h2>
            {conversations.map(c => (
              <button key={c.id} onClick={() => setActiveConv(c.id)} className={`p-4 rounded-[2px] text-left transition-colors w-full ${activeConv === c.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                <div className="font-bold">Conversation {c.id.slice(0,6)}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Chat */}
        <div className="flex-1 glass-card border border-white/10 rounded-[2px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`p-3 rounded-[2px] max-w-[70%] ${m.senderId === uid ? 'ml-auto bg-mint text-black' : 'bg-white/5'}`}>
                {m.content}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/10 flex gap-2">
            <input 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-transparent outline-none p-2 border border-white/10 rounded-[2px]"
              placeholder="Transmit message..."
            />
            <button onClick={send} className="px-6 bg-mint text-black font-bold rounded-[2px]">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
