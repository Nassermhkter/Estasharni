import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from '../lib/firebase';
import { User, UserRole } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  loginWithFacebook: (role: UserRole) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async (role: UserRole) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUser(result.user, role);
    } catch (error) {
      console.error(error);
      toast.error('فشل تسجيل الدخول عبر جوجل');
    }
  };

  const loginWithFacebook = async (role: UserRole) => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await syncUser(result.user, role);
    } catch (error) {
      console.error(error);
      toast.error('فشل تسجيل الدخول عبر فيسبوك');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      
      let userData: User;
      
      const isAdminEmail = email === 'admin@estasharni.com' || email === 'hadirynasser@gmail.com' || email === 'manager@estasharni.com';

      if (userDoc.exists()) {
        userData = userDoc.data() as User;
        if (isAdminEmail && userData.role !== 'admin') {
          userData.role = 'admin';
          await updateDoc(userRef, { role: 'admin' });
        }
      } else {
        // If user exists in Auth but not in Firestore yet
        userData = {
          uid: result.user.uid,
          email,
          displayName: result.user.displayName || email.split('@')[0],
          photoURL: result.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
          role: isAdminEmail ? 'admin' : 'client',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, userData);
      }
      
      setUserData(userData);
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error) {
      console.error(error);
      toast.error('فشل تسجيل الدخول. يرجى التحقق من البيانات.');
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: UserRole) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      
      const isAdminEmail = email === 'admin@estasharni.com' || email === 'hadirynasser@gmail.com' || email === 'manager@estasharni.com';
      const finalRole = isAdminEmail ? 'admin' : role;

      const newUser: User = {
        uid: result.user.uid,
        email,
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
        role: finalRole,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', result.user.uid), newUser);
      setUserData(newUser);
      toast.success(finalRole === 'admin' ? 'مرحباً أيها المدير' : 'تم إنشاء الحساب بنجاح');
    } catch (error) {
      console.error(error);
      toast.error('فشل إنشاء الحساب');
    }
  };

  const syncUser = async (user: FirebaseUser, role: UserRole) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    // Special admin check
    let finalRole = role;
    const isAdminEmail = 
      user.email === 'admin@estasharni.com' || 
      user.email === 'hadirynasser@gmail.com' || 
      user.email === 'manager@estasharni.com';
    
    if (isAdminEmail) {
      finalRole = 'admin';
    }

    if (!userDoc.exists()) {
      const newUser: User = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`,
        role: finalRole,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, newUser);
      setUserData(newUser);
      toast.success(finalRole === 'admin' ? 'مرحباً أيها المدير' : 'تم التسجيل بنجاح');
    } else {
      const existingData = userDoc.data() as User;
      // Ensure admin roles are synced
      if (isAdminEmail && existingData.role !== 'admin') {
        existingData.role = 'admin';
        await updateDoc(userRef, { role: 'admin' });
      }
      setUserData(existingData);
      toast.success('تم تسجيل الدخول بنجاح');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
    toast.success('تم تسجيل الخروج');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      loginWithGoogle, 
      loginWithFacebook, 
      loginWithEmail,
      registerWithEmail,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
