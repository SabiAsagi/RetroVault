"use client";
import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  bio?: string;
  role: 'user' | 'admin' | 'ADMIN' | 'MODERATOR';
  connectedAccounts: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (provider?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const user: User | null = session?.user ? {
    id: (session.user as any).id || '',
    email: session.user.email || '',
    nickname: session.user.name || '',
    avatar: session.user.image || '',
    bio: (session.user as any).bio || '',
    role: (session.user as any).role || 'user',
    connectedAccounts: []
  } : null;

  const login = (provider?: string) => {
    if (provider === 'email') {
      window.location.href = '/login';
    } else {
      signIn(provider);
    }
  };

  const logout = () => {
    signOut();
  };

  const updateProfile = async (updates: Partial<User>) => {
    await update(updates);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: status === "authenticated", login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
