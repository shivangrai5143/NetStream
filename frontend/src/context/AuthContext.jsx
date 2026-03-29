import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { profileService } from '../services/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeProfile, setActiveProfile] = useState(() => {
    const p = localStorage.getItem('netflix_profile');
    return p ? JSON.parse(p) : null;
  });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch custom user doc from Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        let userData = { uid: currentUser.uid, email: currentUser.email };
        
        if (userSnap.exists()) {
          userData = { ...userData, ...userSnap.data() };
        } else {
          // Create firestore user doc if missing
          const defaultUserData = { 
            email: currentUser.email, 
            createdAt: new Date().toISOString(),
            role: 'user'
          };
          await setDoc(userRef, defaultUserData);
          userData = { ...userData, ...defaultUserData };
        }
        
        setUser(userData);
        // Fetch profiles
        const userProfiles = await profileService.getAll(currentUser.uid);
        setProfiles(userProfiles || []); 
      } else {
        setUser(null);
        setActiveProfile(null);
        setProfiles([]);
        localStorage.removeItem('netflix_profile');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async ({ email, password, username }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create their firestore record
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username,
      email,
      createdAt: new Date().toISOString(),
      role: 'user'
    });
    return userCredential;
  };

  const login = async ({ email, password }) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if user doc exists
    const userRef = doc(db, 'users', userCredential.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        username: userCredential.user.displayName,
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
        role: 'user'
      });
    }
    return userCredential;
  };

  const logout = async () => {
    return signOut(auth);
  };

  const selectProfile = (profile) => {
    setActiveProfile(profile);
    localStorage.setItem('netflix_profile', JSON.stringify(profile));
  };

  const refreshProfiles = async () => {
    if (!auth.currentUser) return;
    const userProfiles = await profileService.getAll(auth.currentUser.uid);
    setProfiles(userProfiles || []);
    return userProfiles;
  };

  // We expose setProfiles so the ProfileService can update this state
  return (
    <AuthContext.Provider value={{
      user, loading, activeProfile, profiles,
      login, signup, loginWithGoogle, logout,
      selectProfile, refreshProfiles, setProfiles
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
