"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { baseApi } from '@/configs/axios';

type UserContextType = {
  role: string | null;
  isLoading: boolean;
  hasPermission: (requiredRole: string[]) => boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetchUserRole = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const response = await baseApi.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRole(response.data.role);
    } catch (error) {
      console.error('Erro ao buscar papel do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  const hasPermission = (requiredRoles: string[]) => {
    if (!role) return false;
    return requiredRoles.includes(role);
  };

  return (
    <UserContext.Provider value={{ role, isLoading, hasPermission }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
} 