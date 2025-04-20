"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, UserPlus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";
import { baseApi } from "@/configs/axios";
import { UserRole } from "@/types/enums";

// Define user types
type Role = "Admin" | "Global Editor" | "User";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  clerkId: string;
  isActive: boolean;
};

export function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [regularUsers, setRegularUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("Global Editor");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { getToken } = useAuth();

  // Fetch all users from the API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await baseApi.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const fetchedUsers = response.data;
      setUsers(fetchedUsers);
      
      // Split users by role
      const admins = fetchedUsers.filter((user: User) => 
        user.role === UserRole.ADMIN || user.role === UserRole.GLOBAL_EDITOR
      );
      const regulars = fetchedUsers.filter((user: User) => 
        user.role === UserRole.USER
      );
      
      setAdminUsers(admins);
      setRegularUsers(regulars);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle updating a user's role
  const updateUserRole = async (userId: string, role: Role) => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      await baseApi.patch(`/users/${userId}/role`, { role }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refetch users to update the state
      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectUserForEdit = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const success = await updateUserRole(editingUser.id, selectedRole);
    if (success) {
      setIsEditUserDialogOpen(false);
      setEditingUser(null);
    }
  };

  const handlePromoteToAdmin = async (user: User, newRole: Role) => {
    const success = await updateUserRole(user.id, newRole);
    if (success) {
      setIsAddUserDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDemoteToRegularUser = async (userId: string) => {
    const success = await updateUserRole(userId, "User");
    if (success) {
      setIsDeleteUserDialogOpen(false);
      setDeletingUser(null);
    }
  };

  const getFullName = (user: User) => {
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button 
          variant="outline" 
          onClick={fetchUsers}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Dialog
          open={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Promote User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Promote User</DialogTitle>
              <DialogDescription>
                Select a user to promote to admin or editor role.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">
                  User
                </Label>
                <Select
                  value={selectedUser?.id}
                  onValueChange={(value) =>
                    setSelectedUser(
                      regularUsers.find((user) => user.id === value) || null
                    )
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {regularUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {getFullName(user)} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: Role) =>
                    setSelectedRole(value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Global Editor">
                      Global Editor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => selectedUser && handlePromoteToAdmin(selectedUser, selectedRole)}
                disabled={!selectedUser || isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Promote User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                Loading users...
              </TableCell>
            </TableRow>
          ) : adminUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No admin users found.
              </TableCell>
            </TableRow>
          ) : (
            adminUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{getFullName(user)}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => handleSelectUserForEdit(user)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setDeletingUser(user);
                      setIsDeleteUserDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Update the role of the admin user.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateRole}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <div className="col-span-3">{getFullName(editingUser)}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email
                  </Label>
                  <div className="col-span-3">{editingUser.email}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value: Role) => setSelectedRole(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Global Editor">
                        Global Editor
                      </SelectItem>
                      <SelectItem value="User">
                        Regular User
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={isDeleteUserDialogOpen}
        onOpenChange={setIsDeleteUserDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Demote User</DialogTitle>
            <DialogDescription>
              Are you sure you want to demote this user to a regular user? They will lose all admin privileges.
            </DialogDescription>
          </DialogHeader>
          {deletingUser && (
            <div className="py-4">
              <p>
                <strong>Name:</strong> {getFullName(deletingUser)}
              </p>
              <p>
                <strong>Email:</strong> {deletingUser.email}
              </p>
              <p>
                <strong>Current Role:</strong> {deletingUser.role}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteUserDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingUser && handleDemoteToRegularUser(deletingUser.id)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Demoting..." : "Demote to Regular User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}