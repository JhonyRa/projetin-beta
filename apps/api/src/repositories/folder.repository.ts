import { IsNull } from 'typeorm';
import { AppDataSource } from '../database/config/database';
import { Folder } from '../database/entities/Folder';
import { Video } from '../database/entities/Video';
import { CreateFolderInput, UpdateFolderInput } from '../schemas/folder.schema';

export class FolderRepository {
  private folderRepository = AppDataSource.getRepository(Folder);
  private videoRepository = AppDataSource.getRepository(Video);

  async create(data: CreateFolderInput, userId: string): Promise<Folder> {
    const folder = this.folderRepository.create({
      ...data,
      createdByUser: { id: userId },
    });
    return await this.folderRepository.save(folder);
  }

  async findById(folderId: string): Promise<Folder | null> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });

    if (!folder) return null;

    return folder;
  }

  async findFolderContents(folderId: string) {
    const [videos, childFolders] = await Promise.all([
      this.videoRepository.find({
        where: { folderId, isActive: true },
        order: { displayOrder: 'ASC' },
        select: ['id', 'title', 'thumbnailUrl', 'description', 'displayOrder'],
      }),
      this.folderRepository.find({
        where: { fatherFolderId: folderId },
        order: { displayOrder: 'ASC' },
        select: ['id', 'name', 'description', 'displayOrder'],
      }),
    ]);

    // Check if each child folder has content
    const childFoldersWithContentInfo = await Promise.all(
      childFolders.map(async (folder) => {
        const folderVideos = await this.videoRepository.count({
          where: { folderId: folder.id, isActive: true }
        });
        
        const folderChildren = await this.folderRepository.count({
          where: { fatherFolderId: folder.id }
        });
        
        return {
          ...folder,
          hasContent: folderVideos > 0 || folderChildren > 0
        };
      })
    );

    return {
      videos,
      childFolders: childFoldersWithContentInfo,
    };
  }

  async update(folderId: string, data: UpdateFolderInput): Promise<Folder> {
    // Se displayOrder for undefined, não atualiza o campo
    const updateData: Partial<Folder> = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder })
    };

    await this.folderRepository.update(folderId, updateData);
    return (await this.findById(folderId))!;
  }

  async delete(folderId: string): Promise<void> {
    await this.folderRepository.update(folderId, { deletedAt: new Date() });
  }

  async findAll(): Promise<(Folder & { hasContent: boolean })[]> {
    const rootFolders = await this.folderRepository.find({
      where: {
        fatherFolderId: IsNull(),
      },
      order: {
        displayOrder: 'ASC',
      },
    });
    
    // For each folder, check if it has any content (child folders or videos)
    const foldersWithContentInfo = await Promise.all(
      rootFolders.map(async (folder) => {
        const { childFolders, videos } = await this.findFolderContents(folder.id);
        return {
          ...folder,
          hasContent: childFolders.length > 0 || videos.length > 0
        };
      })
    );
    
    return foldersWithContentInfo;
  }
} 

export const folderRepository = new FolderRepository();