import { AppError } from "../errors/app-error";
import { folderRepository } from "../repositories/folder.repository";
import { videoRepository } from "../repositories/video.repository";
import { videoService } from "./video.service";
import { CreateFolderInput, UpdateFolderInput } from "../schemas/folder.schema";
import { folderPermissionService } from "./folder-permission.service";

export class FolderService {
  async create(data: CreateFolderInput, userId: string) {
    const folder = await folderRepository.create(data, userId);
    if (data.editorToAddIds?.length) {
      await folderPermissionService.create(
        data.editorToAddIds,
        userId,
        folder.id
      );
    }
    return folder;
  }

  async findById(folderId: string, userId?: string) {
    const folder = await folderRepository.findById(folderId);
    if (!folder) {
      throw new AppError("Pasta não encontrada", 404);
    }

    const { videos, childFolders } = await folderRepository.findFolderContents(
      folderId
    );

    // Adicionar URLs das thumbnails e informação de visualização para cada vídeo
    const videosWithUrls = await Promise.all(
      videos.map(async (video) => {
        const thumbnailUrl = await videoService.getThumbnailUrl(video.thumbnailUrl);
        let viewed = false;
        if (userId) {
          const videoView = await videoService.getVideoViews(video.id, userId);
          viewed = !!videoView;
        }
        return { ...video, thumbnailUrl, viewed };
      })
    );

    return { ...folder, videos: videosWithUrls, childFolders };
  }

  async update(folderId: string, data: UpdateFolderInput, userId: string) {
    const folder = await folderRepository.findById(folderId);
    if (!folder) {
      throw new AppError("Pasta não encontrada", 404);
    }
    if (data.editorToAddIds?.length) {
      await folderPermissionService.create(
        data.editorToAddIds,
        userId,
        folder.id
      );
    }
    if (data.editorToRemoveIds?.length) {
      await folderPermissionService.delete(
        data.editorToRemoveIds,
        folder.id
      );
    }
    return await folderRepository.update(folderId, data);
  }

  async delete(folderId: string) {
    const folder = await folderRepository.findById(folderId);
    if (!folder) {
      throw new AppError("Pasta não encontrada", 404);
    }

    await folderRepository.delete(folderId);
  }

  async findAll() {
    return await folderRepository.findAll();
  }

  async deleteRecursively(folderId: string) {
    const folder = await folderRepository.findById(folderId);
    if (!folder) {
      throw new AppError("Pasta não encontrada", 404);
    }
    const { videos, childFolders } = await folderRepository.findFolderContents(
      folderId
    );
    // Deletar todos os vídeos da pasta
    for (const video of videos) {
      // Atualizar o vídeo para remover a referência da pasta antes de desativá-lo
      await videoRepository.update(video.id, {
        folderId: undefined,
        isActive: false,
      });
    }
    // Deletar recursivamente todas as pastas filhas
    for (const childFolder of childFolders) {
      await this.deleteRecursively(childFolder.id);
    }
    // Finalmente, deletar a pasta
    await folderService.delete(folderId);
  }
}

export const folderService = new FolderService();