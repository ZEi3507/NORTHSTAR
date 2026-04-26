import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useMessaging = (convId: string | null) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!convId) return;
    const q = query(collection(db, 'conversations', convId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [convId]);

  const sendMessage = async (senderId: string, content: string) => {
    if (!convId) return;
    await addDoc(collection(db, 'conversations', convId, 'messages'), {
      senderId,
      content,
      createdAt: serverTimestamp()
    });
  };

  return { messages, sendMessage };
};
