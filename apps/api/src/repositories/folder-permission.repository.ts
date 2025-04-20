import { FolderPermissionType } from "../@types/enums";
import { AppDataSource } from "../database/config/database";
import { FolderPermission } from "../database/entities/FolderPermission";
import { Folder } from "../database/entities/Folder";
import { IsNull } from "typeorm";
import { User } from "../database/entities/User";

export class FolderPermissionRepository {
  private folderPermissionRepository =
    AppDataSource.getRepository(FolderPermission);
  private folderRepository = AppDataSource.getRepository(Folder);
  private userRepository = AppDataSource.getRepository(User);

  async create(
    editorToAddIds: string[],
    grantedByUserId: string,
    folderId: string
  ) {
    for (const editorId of editorToAddIds) {
      const folderPermission = this.folderPermissionRepository.create({
        userId: editorId,
        grantedByUserId,
        folderId,
        permissionType: FolderPermissionType.EDITOR,
      });
      await this.folderPermissionRepository.save(folderPermission);
    }
  }

  async delete(editorToRemoveIds: string[], folderId: string) {
    for (const editorId of editorToRemoveIds) {
      await this.folderPermissionRepository.update(
        { userId: editorId, folderId },
        { deletedAt: new Date() }
      );
    }
  }

  async findByUserIdAndFolderId(userId: string, folderId: string) {
    return this.folderPermissionRepository.findOne({
      where: {
        userId,
        folderId,
        permissionType: FolderPermissionType.EDITOR,
        deletedAt: IsNull()
      },
    });
  }

  private async getFolderWithParent(folderId: string): Promise<Folder | null> {
    return await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['fatherFolder'],
    });
  }

  async checkRecursivePermission(userId: string, folderId: string): Promise<boolean> {
    let currentFolder = await this.getFolderWithParent(folderId);
    
    while (currentFolder) {
      const hasPermission = await this.findByUserIdAndFolderId(userId, currentFolder.id);
      if (hasPermission) {
        return true;
      }
      
      if (!currentFolder.fatherFolderId) {
        break;
      }
      
      currentFolder = await this.getFolderWithParent(currentFolder.fatherFolderId);
    }
    
    return false;
  }

  async findByFolderAndUser(folderId: string, userId: string): Promise<FolderPermission | null> {
    return this.folderPermissionRepository.findOne({
      where: {
        folderId,
        userId
      }
    });
  }

  async findEditorsByFolderId(folderId: string): Promise<User[]> {
    const permissions = await this.folderPermissionRepository.find({
      where: {
        folderId,
        permissionType: FolderPermissionType.EDITOR,
        deletedAt: IsNull()
      },
      relations: {
        user: true
      }
    });

    return permissions.map(permission => permission.user);
  }
}

export const folderPermissionRepository = new FolderPermissionRepository();
