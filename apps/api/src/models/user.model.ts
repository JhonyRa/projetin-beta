export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  googleId: string;
  role: 'Admin' | 'Global Editor' | 'User';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos (opcional)
  // folders?: Folder[];
  // folderPermissions?: FolderPermission[];
  // videos?: Video[];
  // videoViews?: VideoView[];
}
