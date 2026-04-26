import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, collection, query, where } from 'firebase/firestore';
import { db } from './firebase';

const PRESENCE_PATH = 'presence';

export const updatePresence = async (uid: string, status: 'online' | 'offline') => {
  const presenceRef = doc(db, PRESENCE_PATH, uid);
  
  if (status === 'online') {
    await setDoc(presenceRef, {
      status: 'online',
      lastSeen: serverTimestamp(),
    }, { merge: true });
  } else {
    await updateDoc(presenceRef, {
      status: 'offline',
      lastSeen: serverTimestamp(),
    });
  }
};

export const subscribeToActiveUsers = (callback: (count: number) => void) => {
  const q = query(collection(db, PRESENCE_PATH), where('status', '==', 'online'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
};
