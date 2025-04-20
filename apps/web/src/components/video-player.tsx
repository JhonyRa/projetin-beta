"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { baseApi } from "@/configs/axios";
import { useAuth } from "@clerk/nextjs";
import { Maximize, Minimize, Play, Pause, Volume2, VolumeX, Check, Eye, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  videoUrl: string;
  videoId?: string;
  onClose?: () => void;
  onNearEnd?: (data: { completed: boolean; watchDurationSeconds: number }) => void;
  onViewStatusChange?: (viewed: boolean) => void;
  totalViews: number;
  initialIsViewed?: boolean;
}

export function VideoPlayer({ 
  videoUrl, 
  videoId, 
  onClose, 
  onNearEnd, 
  onViewStatusChange,
  totalViews: initialTotalViews,
  initialIsViewed = false 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isViewed, setIsViewed] = useState(initialIsViewed);
  const [views, setViews] = useState(initialTotalViews);
  const { getToken } = useAuth();
  const { toast } = useToast();

  // Função para atualizar o total de visualizações
  const updateTotalViews = async () => {
    if (!videoId) return;

    try {
      const token = await getToken();
      const response = await baseApi.get(`/videos/${videoId}/total-views`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setViews(response.data.totalViews);
    } catch (error) {
      console.error("Erro ao buscar total de visualizações:", error);
    }
  };
  
  // Atualiza as visualizações quando o componente é montado
  useEffect(() => {
    updateTotalViews();
    // Criar um intervalo para atualizar as visualizações a cada 10 segundos
    const interval = setInterval(() => {
      updateTotalViews();
    }, 10000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Verifica se o vídeo está próximo do fim (5 segundos)
      if (onNearEnd && !isViewed && videoRef.current.duration > 0) {
        const timeRemaining = videoRef.current.duration - videoRef.current.currentTime;
        if (timeRemaining <= 5) {
          onNearEnd({
            completed: true,
            watchDurationSeconds: Math.floor(videoRef.current.currentTime)
          });
          setIsViewed(true); // Evita chamar onNearEnd múltiplas vezes
          if (onViewStatusChange) {
            onViewStatusChange(true);
          }
        }
      }
    }
  };

  const handleVideoView = async () => {
    if (!videoId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do vídeo não encontrado.",
      });
      return;
    }

    if (isViewed) {
      toast({
        variant: "default",
        title: "Aviso",
        description: "Este vídeo já foi marcado como visto.",
      });
      return;
    }

    try {
      const token = await getToken();
      
      if (!token) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você precisa estar autenticado para marcar um vídeo como visto.",
        });
        return;
      }

      await baseApi.post(`/videos/${videoId}/view`, {
        watchDurationSeconds: Math.floor(currentTime),
        completed: false
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setIsViewed(true);
      // Notifica o componente pai sobre a mudança de status
      if (onViewStatusChange) {
        onViewStatusChange(true);
      }
      // Atualiza o total de visualizações da API
      await updateTotalViews();
      toast({
        title: "Vídeo marcado como visto",
        description: "Sua visualização foi registrada com sucesso.",
      });
    } catch (error) {
      console.error("Erro detalhado ao marcar vídeo como visto:", error);
      toast({
        variant: "destructive",
        title: "Erro ao marcar vídeo",
        description: "Não foi possível registrar a visualização. Tente novamente.",
      });
    }
  };

  const handleUnmarkVideo = async () => {
    if (!videoId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do vídeo não encontrado.",
      });
      return;
    }

    try {
      const token = await getToken();
      
      if (!token) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você precisa estar autenticado para desmarcar o vídeo.",
        });
        return;
      }

      await baseApi.delete(`/videos/${videoId}/view`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setIsViewed(false);
      // Notifica o componente pai sobre a mudança de status
      if (onViewStatusChange) {
        onViewStatusChange(false);
      }
      // Atualiza o total de visualizações da API
      await updateTotalViews();
      toast({
        title: "Vídeo desmarcado",
        description: "O vídeo foi desmarcado como visto.",
      });
    } catch (error) {
      console.error("Erro ao desmarcar vídeo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao desmarcar vídeo",
        description: "Não foi possível desmarcar o vídeo. Tente novamente.",
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume > 0 ? volume : 0.5;
        setVolume(volume > 0 ? volume : 0.5);
      } else {
        videoRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleFullScreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message}`);
      });
    }
  };

  // Listen for fullscreen change events (e.g., when user presses Esc to exit)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {onClose && (
        <Button
          variant="ghost"
          className="absolute top-2 right-2 z-10 text-white"
          onClick={onClose}
        >
          ✕
        </Button>
      )}
      
      <div 
        ref={videoContainerRef}
        className={`relative aspect-video bg-black rounded-lg overflow-hidden ${isFullScreen ? 'w-screen h-screen' : 'w-full'}`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        )}
        
        {isViewed ? (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
            <div className="bg-green-500 text-white px-2 py-1 rounded-md flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span className="text-sm">Visualizado</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-red-500/10 hover:bg-red-500/20 text-white"
              onClick={handleUnmarkVideo}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Desmarcar
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 left-2 z-10 bg-white/10 hover:bg-white/20 text-white"
            onClick={handleVideoView}
          >
            <Eye className="h-4 w-4 mr-1" />
            Marcar como visto
          </Button>
        )}
        
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onLoadedData={() => setIsLoading(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={handleTimeUpdate}
          onClick={handlePlay}
        />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max={duration || 1}
              value={currentTime}
              onChange={(e) => {
                const time = parseFloat(e.target.value);
                if (videoRef.current) {
                  videoRef.current.currentTime = time;
                }
              }}
              className="w-full accent-white h-1 bg-white/20 rounded-full cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white h-8 w-8 p-0"
                onClick={handlePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <span className="text-white text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white h-8 w-8 p-0"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 accent-white h-1 bg-white/20 rounded-full cursor-pointer"
                />
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white h-8 w-8 p-0"
                onClick={toggleFullScreen}
              >
                {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contador de visualizações */}
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <Eye className="h-4 w-4" />
        <span>{views} {views === 1 ? 'visualização' : 'visualizações'}</span>
      </div>
    </div>
  );
}
