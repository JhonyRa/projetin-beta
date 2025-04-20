"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { EditVideoForm } from "@/components/edit-video-form";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
});

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [videoData, setVideoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideoData() {
      try {
        setIsLoading(true);
        const token = await getToken();

        if (!token) {
          throw new Error("Não autorizado");
        }

        const response = await api.get(`/videos/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setVideoData(response.data);
      } catch (error) {
        console.error("Erro ao carregar vídeo:", error);
        setError("Não foi possível carregar os dados do vídeo");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchVideoData();
    }
  }, [params.id, getToken]);

  const handleSuccess = () => {
    router.push(`/video/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-1/4 bg-gray-200 rounded mb-4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error || "Vídeo não encontrado"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Vídeo</h1>
      <div className="max-w-2xl">
        <EditVideoForm
          videoId={params.id as string}
          initialData={{
            title: videoData.title,
            description: videoData.description,
            displayOrder: videoData.displayOrder
          }}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
} 