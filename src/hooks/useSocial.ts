import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState, useEffect } from 'react';
import { useConductorStore } from '../stores/conductorStore';

export type ConnectionType = 'follower' | 'study_partner' | 'business_partner';
export type ConnectionStatus = 'pending' | 'accepted';

export interface SocialConnection {
  id: string;
  fromId: string;
  toId: string;
  type: ConnectionType;
  status: ConnectionStatus;
  createdAt: Timestamp;
  participants: string[]; // Added for easier querying
}

export const useSocial = () => {
  const currentUid = useConductorStore(state => state.uid);

  const checkDuplicate = async (toUid: string, type: ConnectionType) => {
    const q = query(
      collection(db, 'connections'),
      where('participants', 'array-contains', currentUid),
      where('type', '==', type)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.some(doc => {
      const data = doc.data();
      return data.participants.includes(toUid);
    });
  };

  const follow = async (toUid: string) => {
    if (!currentUid) throw new Error('Unauthenticated');
    if (currentUid === toUid) throw new Error('Cannot follow yourself');
    
    if (await checkDuplicate(toUid, 'follower')) {
        throw new Error('Already following this user');
    }

    try {
      await addDoc(collection(db, 'connections'), {
        fromId: currentUid,
        toId: toUid,
        type: 'follower',
        status: 'accepted',
        createdAt: serverTimestamp(),
        participants: [currentUid, toUid]
      });
    } catch (error) {
      console.error('Error following scholar:', error);
      throw error;
    }
  };

  const requestPartner = async (toUid: string, type: 'study_partner' | 'business_partner') => {
    if (!currentUid) throw new Error('Unauthenticated');
    if (currentUid === toUid) throw new Error('Cannot partner with yourself');

    if (await checkDuplicate(toUid, type)) {
        throw new Error(`Connection request for ${type} already exists`);
    }

    try {
      await addDoc(collection(db, 'connections'), {
        fromId: currentUid,
        toId: toUid,
        type,
        status: 'pending',
        createdAt: serverTimestamp(),
        participants: [currentUid, toUid]
      });
    } catch (error) {
      console.error('Error requesting partnership:', error);
      throw error;
    }
  };

  const acceptPartner = async (connectionId: string) => {
    try {
      const connectionRef = doc(db, 'connections', connectionId);
      await updateDoc(connectionRef, {
        status: 'accepted'
      });
    } catch (error) {
      console.error('Error accepting partnership:', error);
      throw error;
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      const connectionRef = doc(db, 'connections', connectionId);
      await deleteDoc(connectionRef);
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  };

  return { follow, requestPartner, acceptPartner, removeConnection };
};

export const useConnections = (uid: string | null) => {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setConnections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'connections'),
      where('participants', 'array-contains', uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newConnections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SocialConnection[];
      
      setConnections(newConnections);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to connections:', err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { connections, loading, error };
};
