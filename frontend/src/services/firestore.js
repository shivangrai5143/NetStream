import { db } from '../firebase';
import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, 
  deleteDoc, query, where, orderBy, updateDoc 
} from 'firebase/firestore';

// Helper to get uid
const getUserRef = (uid) => doc(db, 'users', uid);
const getProfilesRef = (uid) => collection(db, 'users', uid, 'profiles');

// Profiles
export const profileService = {
  getAll: async (uid) => {
    const q = query(getProfilesRef(uid), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  },
  create: async (uid, data) => {
    const defaultData = { ...data, createdAt: new Date().toISOString() };
    const docRef = await addDoc(getProfilesRef(uid), defaultData);
    return { _id: docRef.id, ...defaultData };
  },
  delete: async (uid, profileId) => {
    await deleteDoc(doc(db, 'users', uid, 'profiles', profileId));
  }
};

// Watchlist
export const watchlistService = {
  get: async (uid, profileId) => {
    const listRef = collection(db, 'users', uid, 'profiles', profileId, 'watchlist');
    const q = query(listRef, orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  add: async (uid, profileId, data) => {
    // We use movieId as the doc ID to prevent duplicates easily
    const docRef = doc(db, 'users', uid, 'profiles', profileId, 'watchlist', String(data.movieId));
    const itemData = { ...data, addedAt: new Date().toISOString() };
    await setDoc(docRef, itemData);
    return { id: docRef.id, ...itemData };
  },
  remove: async (uid, profileId, movieId) => {
    await deleteDoc(doc(db, 'users', uid, 'profiles', profileId, 'watchlist', String(movieId)));
  }
};

// History (Continue Watching)
export const historyService = {
  get: async (uid, profileId) => {
    const listRef = collection(db, 'users', uid, 'profiles', profileId, 'history');
    const q = query(listRef, orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  add: async (uid, profileId, data) => {
    const docRef = doc(db, 'users', uid, 'profiles', profileId, 'history', String(data.movieId));
    const itemData = { ...data, updatedAt: new Date().toISOString() };
    await setDoc(docRef, itemData);
    return { id: docRef.id, ...itemData };
  },
  remove: async (uid, profileId, movieId) => {
    await deleteDoc(doc(db, 'users', uid, 'profiles', profileId, 'history', String(movieId)));
  },
  clear: async (uid, profileId) => {
    const listRef = collection(db, 'users', uid, 'profiles', profileId, 'history');
    const snap = await getDocs(listRef);
    const promises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  }
};

// Reviews
export const reviewService = {
  getForMovie: async (movieKey) => {
    const q = query(collection(db, 'reviews', movieKey, 'items'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  add: async (movieKey, data) => {
    const docRef = doc(collection(db, 'reviews', movieKey, 'items'));
    const reviewData = { ...data, createdAt: new Date().toISOString() };
    await setDoc(docRef, reviewData);
    return { id: docRef.id, ...reviewData };
  }
};

// Admin
export const adminService = {
  getFeatured: async () => {
    const q = query(collection(db, 'admin', 'movies', 'featured'), orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  addFeatured: async (data) => {
    const docRef = await addDoc(collection(db, 'admin', 'movies', 'featured'), {
      ...data, addedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },
  removeFeatured: async (id) => {
    await deleteDoc(doc(db, 'admin', 'movies', 'featured', id));
  },
  getUsers: async () => {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  }
};
