"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useClerk, useAuth } from "@clerk/nextjs";
import { baseApi } from "@/configs/axios";
import axios from "axios";
import { VideoContentGrid } from "@/components/video-content-grid";
import { FolderPath } from "@/components/folder-path";
import type { FolderBreadcrumb } from "@/components/folder-path";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload } from "lucide-react";
import { AddFolderDialog } from "@/components/add-folder-dialog";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useUser } from "@/contexts/user-context";
import { useFolderPermission } from "@/hooks/use-folder-permission";

type CreateUserData = {
  email: string;
  firstName: string;
  lastName: string;
  clerkId: string;
};

function DashboardContent() {
  const clerk = useClerk();
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folderId');
  const [folderPath, setFolderPath] = useState<FolderBreadcrumb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isLoaded, userId, isSignedIn, getToken } = useAuth();
  const { toast } = useToast();
  const { role } = useUser();
  const { hasPermission: hasFolderPermission, isLoading: isCheckingPermission } = useFolderPermission(folderId);
  
  // Check if user can upload (has global role or folder permission)
  const canUpload = role === "Admin" || role === "Global Editor" || hasFolderPermission;
  // Check if user can create folders (has global role or folder permission)
  const canCreateFolder = role === "Admin" || role === "Global Editor" || hasFolderPermission;

  const createUser = async (userData: CreateUserData) => {
    // Get token with better error handling
    let token;
    try {
      token = await getToken();
    } catch (authError) {
      console.error('Authentication error in createUser:', authError);
      throw new Error('Failed to get authentication token');
    }
    try {
      await baseApi.post('/users', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.log("error: ", error)
      // Ignora erro 409 (usuário já existe)
      if (axios.isAxiosError(error) && error.response?.status !== 409) {
        console.error('Erro ao criar usuário:', error);
      }
    }
  };

  // Function to refresh content
  const refreshContent = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Fetch folder path when folder ID changes or after refresh
  useEffect(() => {
    async function fetchFolderPath() {
      if (!folderId) {
        setFolderPath([{ id: "root", name: "Home" }]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get token with better error handling
        let token;
        try {
          token = await getToken();
        } catch (authError) {
          console.error('Authentication error in fetchFolderPath:', authError);
          throw new Error('Failed to get authentication token');
        }
        
        // First get the current folder
        const folderResponse = await baseApi.get(`/folders/${folderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const currentFolder = folderResponse.data;
        const breadcrumbs = [];
        
        // Add the current folder
        breadcrumbs.push({
          id: currentFolder.id,
          name: currentFolder.name,
          description: currentFolder.description
        });
        
        // Now recursively get parent folders if they exist
        let parentFolderId = currentFolder.fatherFolderId;
        while (parentFolderId) {
          try {
            const parentResponse = await baseApi.get(`/folders/${parentFolderId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            const parentFolder = parentResponse.data;
            // Add parent to the beginning of the breadcrumbs
            breadcrumbs.unshift({
              id: parentFolder.id,
              name: parentFolder.name,
              description: parentFolder.description
            });
            
            // Move up to the next parent
            parentFolderId = parentFolder.fatherFolderId;
          } catch (error) {
            console.error('Error fetching parent folder:', error);
            break; // Stop the loop if there's an error
          }
        }
        
        setFolderPath(breadcrumbs);
      } catch (error) {
        console.error('Error fetching folder path:', error);
        setFolderPath([{ id: "error", name: "Error loading folder" }]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded && isSignedIn) {
      fetchFolderPath();
    }
  }, [folderId, isLoaded, isSignedIn, getToken, refreshKey]);

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      const user = clerk.user;

      if (user) {
        const names = user.fullName?.split(' ') || ['', ''];
        createUser({
          email: user.primaryEmailAddress?.emailAddress || "",
          firstName: names[0],
          lastName: names.slice(1).join(' ') || names[0],
          clerkId: userId,
        });
      }
    }
  }, [isLoaded, isSignedIn, userId, clerk.user]);

  const handleFolderCreated = useCallback(() => {
    console.log("Folder created callback triggered");
    refreshContent();
    toast({
      title: "Conteúdo atualizado",
      description: "A lista de pastas foi atualizada.",
    });
  }, [refreshContent, toast]);

  const handleManualRefresh = () => {
    refreshContent();
    toast({
      title: "Atualizando conteúdo",
      description: "Buscando o conteúdo mais recente...",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <FolderPath 
              path={isLoading ? [{ id: "loading", name: "Loading..." }] : folderPath} 
              isLoading={isLoading}
              showEditButton={!!folderId}
              onFolderUpdated={refreshContent}
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 ml-2 flex items-center justify-center"
              onClick={handleManualRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCheckingPermission ? (
            <Button variant="outline" className="flex items-center gap-2" disabled>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Verificando permissões...
            </Button>
          ) : (
            <>
              {/* Botão de Upload - só aparece dentro de pastas e para usuários com permissão */}
              {folderId && canUpload && (
                <Link href={`/upload-video?folderId=${folderId}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload de Vídeo
                  </Button>
                </Link>
              )}
              {canCreateFolder && (
                <AddFolderDialog 
                  currentFolderId={folderId || undefined} 
                  onFolderCreated={handleFolderCreated}
                />
              )}
            </>
          )}
        </div>
      </div>

      <VideoContentGrid 
        folderId={folderId || undefined} 
        refreshTrigger={refreshKey}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}