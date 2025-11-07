import { create } from 'zustand';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  
  signup: async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  },
  
  login: async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  },
  
  logout: async () => {
    await signOut(auth);
  },
  
  initialize: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },
}));

// Initialize auth state listener
useAuthStore.getState().initialize();
