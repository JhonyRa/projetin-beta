"use client";

import { useState, useEffect } from "react";
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
import { Edit } from "lucide-react";
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

interface Folder {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number | null;
}

interface EditFolderDialogProps {
  folder: Folder;
  onFolderUpdated?: () => void;
}

export function EditFolderDialog({ folder, onFolderUpdated }: EditFolderDialogProps) {
  const [folderName, setFolderName] = useState(folder.name);
  const [folderDescription, setFolderDescription] = useState(folder.description || "");
  const [displayOrder, setDisplayOrder] = useState<number | null>(folder.displayOrder);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [currentEditors, setCurrentEditors] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Carregar editores atuais quando o diálogo abrir
  useEffect(() => {
    const fetchCurrentEditors = async () => {
      try {
        const token = await getToken();
        const response = await baseApi.get(`/folders/${folder.id}/editors`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Editores carregados:', response.data);
        setCurrentEditors(response.data);
        setSelectedUsers(response.data);
      } catch (error) {
        console.error("Error fetching editors:", error);
        toast({
          title: "Erro ao carregar editores",
          description: "Não foi possível carregar os editores da pasta.",
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      fetchCurrentEditors();
    }
  }, [isOpen, folder.id, getToken, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      // Determine which users to add and remove
      const currentEditorIds = new Set(currentEditors.map(editor => editor.id));
      const selectedUserIds = new Set(selectedUsers.map(user => user.id));
      
      const editorToAddIds = selectedUsers
        .filter(user => !currentEditorIds.has(user.id))
        .map(user => user.id);
      
      const editorToRemoveIds = currentEditors
        .filter(editor => !selectedUserIds.has(editor.id))
        .map(editor => editor.id);
      
      const folderData = {
        name: folderName,
        description: folderDescription || null,
        displayOrder,
        editorToAddIds,
        editorToRemoveIds
      };

      console.log('Enviando dados:', folderData);
      
      await baseApi.patch(`/folders/${folder.id}`, folderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast({
        title: "Pasta atualizada",
        description: `A pasta "${folderName}" foi atualizada com sucesso.`,
      });
      
      setIsOpen(false);
      
      if (onFolderUpdated) {
        onFolderUpdated();
      }
      
      router.refresh();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      console.error("Error updating folder:", error);
      
      toast({
        title: "Erro ao atualizar pasta",
        description: apiError.response?.data?.error || "Ocorreu um erro ao atualizar a pasta.",
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
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Pasta</DialogTitle>
          <DialogDescription>
            Altere as informações da pasta e gerencie os usuários com acesso.
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
              <Label className="text-right">Editores</Label>
              <div className="col-span-3">
                {currentEditors.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Usuários com permissão:</p>
                    <div className="space-y-2">
                      {currentEditors.map((editor) => (
                        <div key={editor.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div>
                            <p className="text-sm font-medium">{editor.firstName} {editor.lastName}</p>
                            <p className="text-xs text-gray-500">{editor.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">Nenhum usuário tem permissão nesta pasta.</p>
                )}

                <UserSelectionDialog 
                  onSelectUsers={handleUserSelection}
                  selectedUsers={selectedUsers}
                />
                {selectedUsers.length > 0 && selectedUsers.length !== currentEditors.length && (
                  <div className="mt-2 text-sm text-gray-500">
                    {selectedUsers.length > currentEditors.length ? 
                      `${selectedUsers.length - currentEditors.length} novo(s) usuário(s) será(ão) adicionado(s)` :
                      `${currentEditors.length - selectedUsers.length} usuário(s) será(ão) removido(s)`
                    }
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
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}