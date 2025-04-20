import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { baseApi } from "@/configs/axios";
import { useAuth } from "@clerk/nextjs";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserSelectionDialogProps {
  onSelectUsers: (users: User[]) => void;
  selectedUsers?: User[];
}

export function UserSelectionDialog({ onSelectUsers, selectedUsers = [] }: UserSelectionDialogProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    selectedUsers.map((user: User) => user.id)
  );
  const [isOpen, setIsOpen] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    setSelectedUserIds(selectedUsers.map(user => user.id));
  }, [selectedUsers]);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await baseApi.get<User[]>("/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Usuários carregados:', data);
      return data;
    }
  });

  const handleSelectionChange = (userId: string, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedUserIds, userId]
      : selectedUserIds.filter(id => id !== userId);
    
    setSelectedUserIds(newSelectedIds);
    const selectedUsersList = users.filter(user => newSelectedIds.includes(user.id));
    console.log('Seleção alterada:', selectedUsersList);
    onSelectUsers(selectedUsersList);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Selecionar Usuários</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Selecionar Usuários</DialogTitle>
        </DialogHeader>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Selecionar
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Nome
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedUserIds.includes(user.id)}
                      onChange={(e) => handleSelectionChange(user.id, e.target.checked)}
                    />
                  </td>
                  <td className="p-4">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-4">{user.email}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 