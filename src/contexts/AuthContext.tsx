import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { hygraphRequest, GET_USER_BY_EMAIL, CREATE_USER, PUBLISH_USER } from '../lib/hygraph';
import { hashPassword, verifyPassword, clearAllStorage } from '../lib/authUtils';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for stored session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('taxfyp-user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem('taxfyp-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await hygraphRequest(GET_USER_BY_EMAIL, { email });
      const found = result?.userrs?.[0];
      if (!found) {
        throw new Error('User not found');
      }
      
      // Verify hashed password
      const isValid = await verifyPassword(password, found.password);
      if (!isValid) {
        throw new Error('Invalid password');
      }
      
      const userObj = { id: found.id, email: found.email, name: found.name };
      setUser(userObj);
      sessionStorage.setItem('taxfyp-user', JSON.stringify(userObj));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if user exists
      const existing = await hygraphRequest(GET_USER_BY_EMAIL, { email });
      if (existing?.userrs?.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password before storing
      const hashedPassword = await hashPassword(password);
      
      const result = await hygraphRequest(CREATE_USER, { email, password: hashedPassword, name });
      if (result?.createUserr?.id) {
        await hygraphRequest(PUBLISH_USER, { id: result.createUserr.id });
        const userObj = { id: result.createUserr.id, email, name };
        setUser(userObj);
        sessionStorage.setItem('taxfyp-user', JSON.stringify(userObj));
        return userObj;
      }
      throw new Error('Failed to create user');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    // Clear all browser storage and cookies
    clearAllStorage();
    window.location.reload();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
