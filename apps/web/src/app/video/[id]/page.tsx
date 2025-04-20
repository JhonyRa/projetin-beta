"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoPlayer } from "@/components/video-player";
import { VideoDetails } from "@/components/video-details";
import { baseApi } from "@/configs/axios";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useAuth } from "@clerk/nextjs";

interface VideoData {
  id: string;
  title: string;
  description: string;
  url: string;
  videoUrl: string;
  createdAt: string;
  views: number;
  folderId?: string;
  folderPath: string[];
  uploadDate: string;
  viewed: boolean;
}

export default function VideoPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isViewed = searchParams.get('viewed') === 'true';
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os dados do vídeo
  const fetchData = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !id) return;
    
    try {
      setIsLoading(true);
      const token = await getToken();
      
      // Busca os dados do vídeo
      const videoResponse = await baseApi.get(`/videos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = videoResponse.data;
      
      // Fetch folder information
      let folderPath = ["Root"];
      
      if (data.folderId) {
        try {
          const folderResponse = await baseApi.get(`/folders/${data.folderId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (folderResponse.data) {
            folderPath = [folderResponse.data.name];
            
            // If folder has a parent folder, fetch the path
            if (folderResponse.data.fatherFolderId) {
              try {
                const parentResponse = await baseApi.get(`/folders/${folderResponse.data.fatherFolderId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                
                if (parentResponse.data) {
                  folderPath.unshift(parentResponse.data.name);
                }
              } catch (folderError) {
                console.error("Error fetching parent folder:", folderError);
              }
            }
          }
        } catch (folderError) {
          console.error("Error fetching folder:", folderError);
        }
      }
      
      // Format the data for the components
      setVideoData({
        id: data.id,
        title: data.title,
        description: data.description || "",
        uploadDate: data.createdAt ? format(new Date(data.createdAt), "dd/MM/yyyy") : "-",
        views: data.views || 0,
        videoUrl: data.url,
        url: data.url,
        createdAt: data.createdAt,
        folderId: data.folderId,
        folderPath: folderPath,
        viewed: isViewed || data.viewed || false
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAsViewed = useCallback(async (data: { completed: boolean; watchDurationSeconds: number }) => {
    if (!isLoaded || !isSignedIn || !id) return;

    try {
      const token = await getToken();
      await baseApi.post(
        `/videos/${id}/view`,
        {
          completed: data.completed,
          watchDurationSeconds: data.watchDurationSeconds
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Atualiza o contador de visualizações localmente
      setVideoData((prev) => 
        prev ? { ...prev, views: prev.views + 1, viewed: true } : null
      );
    } catch (error) {
      console.error("Erro ao marcar vídeo como visualizado:", error);
    }
  }, [id, isLoaded, isSignedIn, getToken]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div>Carregando...</div>
      </div>
    );
  }

  if (!isLoading && !videoData) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {videoData && (
        <>
          <VideoPlayer 
            videoUrl={videoData.videoUrl} 
            videoId={videoData.id} 
            onNearEnd={markAsViewed}
            totalViews={videoData.views}
            initialIsViewed={videoData.viewed}
            onViewStatusChange={(viewed) => setVideoData(prev => prev ? {...prev, viewed} : null)}
          />
          <div className="mt-6">
            <VideoDetails video={videoData} />
          </div>
        </>
      )}
    </div>
  );
}
