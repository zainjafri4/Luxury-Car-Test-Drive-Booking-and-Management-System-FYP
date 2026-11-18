'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAccessToken, getAccessToken, ApiError } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'STAFF';
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; fullName: string; phone?: string | undefined }) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get<{ data: User }>('/auth/me');
      setUser(res.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Try refreshing token with cookie
        try {
          const refreshRes = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
          if (refreshRes.data?.accessToken) {
            setAccessToken(refreshRes.data.accessToken);
            const userRes = await api.get<{ data: User }>('/auth/me');
            setUser(userRes.data);
            return;
          }
        } catch {
          // Refresh failed
        }
      }
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const existingToken = getAccessToken();
    if (existingToken) {
      refreshProfile();
    } else {
      // Check if we have an active session cookie
      api
        .post<{ data: { accessToken: string } }>('/auth/refresh')
        .then((res) => {
          if (res.data?.accessToken) {
            setAccessToken(res.data.accessToken);
            return api.get<{ data: User }>('/auth/me').then((u) => setUser(u.data));
          }
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [refreshProfile]);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.post<{ data: { user: User; accessToken: string } }>('/auth/login', {
      email,
      password: pass,
    });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string | undefined;
  }): Promise<User> => {
    const res = await api.post<{ data: { user: User; accessToken: string } }>('/auth/register', data);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best effort
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
