"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderPlus } from "lucide-react";
import { baseApi } from "@/configs/axios";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { UserSelectionDialog } from "./users/user-selection-dialog";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message: string;
}

interface AddFolderDialogProps {
  currentFolderId?: string;
  onFolderCreated?: () => void;
}

export function AddFolderDialog({ currentFolderId, onFolderCreated }: AddFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    
    setIsSubmitting(true);
    try {
      let token;
      try {
        token = await getToken();
      } catch (authError) {
        console.error('Authentication error:', authError);
        throw new Error('Failed to get authentication token');
      }
      
      const folderData = {
        name: folderName,
        description: folderDescription || null,
        fatherFolderId: currentFolderId ? currentFolderId : undefined,
        displayOrder,
        editorToAddIds: selectedUsers.map(user => user.id)
      };
      
      console.log("Creating folder with data:", folderData);
      
      const response = await baseApi.post('/folders', folderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Folder creation response:", response.data);
      
      toast({
        title: "Pasta criada",
        description: `A pasta "${folderName}" foi criada com sucesso.`,
      });
      
      setFolderName("");
      setFolderDescription("");
      setSelectedUsers([]);
      setIsOpen(false);
      
      if (onFolderCreated) {
        onFolderCreated();
      }
      
      router.refresh();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Error creating folder:", apiError);
      console.error("Error details:", apiError.response?.data);
      
      toast({
        title: "Erro ao criar pasta",
        description: apiError.response?.data?.error || "Ocorreu um erro ao criar a pasta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSelection = (users: User[]) => {
    setSelectedUsers(users);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Nova Pasta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Pasta</DialogTitle>
          <DialogDescription>
            Digite um nome e uma descrição opcional para a nova pasta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                className="col-span-3"
                placeholder="Descrição opcional da pasta"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayOrder" className="text-right">
                Ordem da listagem
              </Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder ?? ""}
                onChange={(e) => setDisplayOrder(e.target.value ? Number(e.target.value) : null)}
                className="col-span-3"
                placeholder="Ordem de listagem (opcional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Localização</Label>
              <div className="col-span-3 text-sm text-gray-500">
                {currentFolderId 
                  ? "Esta pasta será criada dentro da pasta atual"
                  : "Esta pasta será criada no nível raiz"}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Usuários</Label>
              <div className="col-span-3">
                <UserSelectionDialog 
                  onSelectUsers={handleUserSelection}
                  selectedUsers={selectedUsers}
                />
                {selectedUsers.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    {selectedUsers.length} usuário(s) selecionado(s)
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting || !folderName.trim()}
            >
              {isSubmitting ? "Criando..." : "Criar Pasta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}