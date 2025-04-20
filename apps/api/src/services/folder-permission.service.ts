import { folderPermissionRepository } from "../repositories/folder-permission.repository";

export class FolderPermissionService { 
  async create(editorToAddIds: string[], grantedByUserId: string, folderId: string) {
    await folderPermissionRepository.create(editorToAddIds, grantedByUserId, folderId);
  }

  async delete(editorToRemoveIds: string[], folderId: string) {
    await folderPermissionRepository.delete(editorToRemoveIds, folderId);
  }

  async userHasPermission(userId: string, folderId: string) {
    return await folderPermissionRepository.checkRecursivePermission(userId, folderId);
  }
}

export const folderPermissionService = new FolderPermissionService();
