import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { baseApi } from '@/configs/axios';
import { useUser } from '@/contexts/user-context';

export function useFolderPermission(folderId?: string | null) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const { role } = useUser();

  const checkPermission = useCallback(async () => {
    // Se não tem folderId, não precisa verificar permissão
    if (!folderId) {
      setHasPermission(false);
      setIsLoading(false);
      return;
    }

    // Se é admin ou global editor, tem permissão automática
    if (role === "Admin" || role === "Global Editor") {
      setHasPermission(true);
      setIsLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const response = await baseApi.get(`/folders/${folderId}/check-permission`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setHasPermission(response.data.hasPermission);
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, [folderId, role, getToken]);

  useEffect(() => {
    setIsLoading(true);
    checkPermission();
  }, [checkPermission]);

  return { hasPermission, isLoading };
} 