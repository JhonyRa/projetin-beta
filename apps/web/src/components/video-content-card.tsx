"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { baseApi } from "@/configs/axios";
import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Folder, ImageIcon, Pencil, PlayCircle, Trash2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EditFolderDialog } from "./edit-folder-dialog";

interface VideoContentCardProps {
  id: string;
  type: "video" | "folder";
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  displayOrder?: number | null;
  isEmpty?: boolean;
  onDelete?: () => void;
  className?: string;
  viewed?: boolean;
}

export function VideoContentCard({
  id,
  type,
  title,
  description,
  thumbnailUrl,
  displayOrder,
  isEmpty = true,
  onDelete,
  className,
  viewed = false
}: VideoContentCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { role } = useUser();

  // Check if user is admin or global editor
  const isAdmin = role === "Admin";
  const isGlobalEditor = role === "Global Editor";

  // Usuários com permissões elevadas (admin ou global editor) podem excluir pastas não vazias
  const hasElevatedPermissions = isAdmin || isGlobalEditor;

  const handleDelete = async () => {
    // Para admins e global editors, não importa se a pasta está vazia ou não
    if (type === "folder" && !isEmpty && !hasElevatedPermissions) {
      toast({
        title: "Não é possível excluir a pasta",
        description:
          "A pasta não está vazia. Remova todo o conteúdo antes de excluí-la.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const token = await getToken();
      await baseApi.delete(`/${type}s/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Sucesso!",
        description: `${type === "folder" ? "Pasta" : "Vídeo"} excluído com sucesso.`,
      });

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Erro!",
        description: `Erro ao excluir ${
          type === "folder" ? "pasta" : "vídeo"
        }. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFolderUpdated = () => {
    // Refresh the page to update the content
    router.refresh();

    // Call the callback if provided
    if (onDelete) {
      onDelete();
    }
  };

  const handleVideoClick = () => {
    if (type === "video") {
      router.push(`/video/${id}?viewed=${viewed}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Impede que o clique propague para o card
    router.push(`/video/${id}/edit`);
  };

  return (
    <>
      <Card
        className={cn("group overflow-hidden cursor-pointer relative", className)}
        onClick={handleVideoClick}
      >
        {description ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full h-full absolute inset-0 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="bg-white p-3 shadow-lg">
                <p className="max-w-[300px] break-words whitespace-pre-line text-sm text-gray-600">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
        <CardHeader className="relative p-4 pb-0">
          <Link
            href={
              type === "video" ? `/video/${id}?viewed=${viewed}` : `/dashboard?folderId=${id}`
            }
          >
            <CardTitle className="flex items-center text-base font-medium group/title">
              <div className="flex-shrink-0 mr-2">
                {type === "folder" ? (
                  <Folder className="h-5 w-5 text-blue-500" />
                ) : (
                  <PlayCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="truncate">{title}</p>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white p-2">
                      <p className="text-sm">{title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {type === "video" && viewed && (
                <div className="flex-shrink-0 ml-2 text-green-500">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className="p-4">
          {type === "video" && (
            <div className="relative aspect-video mb-3 rounded-md overflow-hidden bg-gray-100">
              {thumbnailUrl ? (
                <div
                  className="w-full h-full bg-no-repeat bg-cover bg-center transition-transform hover:scale-105"
                  style={{ backgroundImage: `url(${thumbnailUrl})` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-30 transition-opacity flex items-center justify-center">
                <PlayCircle className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Viewed indicator */}
              {type === "video" && viewed && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {type === "video" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleEditClick(e, id)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : (
                <EditFolderDialog
                  folder={{
                    id,
                    name: title,
                    description: description ?? null,
                    displayOrder: displayOrder ?? null
                  }}
                  onFolderUpdated={handleFolderUpdated}
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {type === "folder" ? "esta pasta" : "este vídeo"}?
              {type === "folder" && !isEmpty && !hasElevatedPermissions && (
                <p className="text-red-500 mt-2">
                  Atenção: Esta pasta contém conteúdo. Remova todo o conteúdo antes de excluí-la.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={type === "folder" && !isEmpty && !hasElevatedPermissions}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
