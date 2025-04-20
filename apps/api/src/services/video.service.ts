import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Video } from "../database/entities/Video";
import { CreateVideoInput, UpdateVideoInput } from "../schemas/video.schema";
import { generateThumbnail } from "../utils/video-utils";
import { getVideoDurationInSeconds } from "get-video-duration";
import { videoRepository } from "../repositories/video.repository";
import { AppError } from "../errors/app-error";
import { Readable } from "stream";
import { userRepository } from "../repositories/user.repository";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { VideoView } from '../database/entities/VideoView';
import { AppDataSource } from '../database/config/database';

export class VideoService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
    videoData: CreateVideoInput,
    userId: string
  ): Promise<Video> {
    // Gerar uma chave única para o S3
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }
    const s3Key = `folder/${videoData.folderId}/videos/${Date.now()}-${file.originalname}`;

    // Upload do arquivo para o S3
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    // Gerar thumbnail
    const thumbnailKey = await generateThumbnail(file.buffer);

    // Converter o buffer em um stream legível com Readable.from
    const bufferStream = Readable.from([file.buffer]);

    // Obter duração do vídeo
    const duration = await getVideoDurationInSeconds(bufferStream);
    // Criar registro do vídeo no banco

    const video = await videoRepository.create({
      folderId: videoData.folderId,
      title: videoData.title,
      description: videoData.description,
      s3Key: s3Key,
      thumbnailUrl: thumbnailKey,
      durationSeconds: Math.round(duration),
      displayOrder: videoData.displayOrder,
      createdByUser: user,
      isActive: true,
    } as unknown as Video);

    return video;
  }

  private async getSignedUrlWithExpiration(s3Key: string, expiresIn: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(this.s3Client as any, command, {
      expiresIn,
    });

    return signedUrl;
  }

  async getVideoUrl(s3Key: string): Promise<string> {
    // URL assinada do S3 (expira em 30 segundos)
    return this.getSignedUrlWithExpiration(s3Key, 30);
  }

  async getThumbnailUrl(thumbnailKey: string): Promise<string> {
    // URL assinada do S3 (expira em 3 horas)
    return this.getSignedUrlWithExpiration(thumbnailKey, 10800); // 3 horas em segundos
  }

  async findById(id: string, userId?: string): Promise<Video & { url: string; thumbnailUrl: string; viewed: boolean }> {
    const video = await videoRepository.findById(id);
    if (!video) {
      throw new AppError("Vídeo não encontrado", 404);
    }

    const [url, thumbnailUrl] = await Promise.all([
      this.getVideoUrl(video.s3Key),
      this.getThumbnailUrl(video.thumbnailUrl),
    ]);

    let viewed = false;
    if (userId) {
      const videoView = await this.getVideoViews(id, userId);
      viewed = !!videoView;
    }

    return { ...video, url, thumbnailUrl, viewed };
  }

  async findByFolderId(folderId: string): Promise<(Video & { url: string; thumbnailUrl: string })[]> {
    const videos = await videoRepository.findByFolderId(folderId);
    const videosWithUrls = await Promise.all(
      videos.map(async (video) => {
        const [url, thumbnailUrl] = await Promise.all([
          this.getVideoUrl(video.s3Key),
          this.getThumbnailUrl(video.thumbnailUrl),
        ]);
        return { ...video, url, thumbnailUrl };
      })
    );
    return videosWithUrls;
  }

  async delete(id: string): Promise<void> {
    const deleted = await videoRepository.delete(id);
    if (!deleted) {
      throw new AppError("Vídeo não encontrado", 404);
    }
  }

  async update(id: string, data: Partial<Video>): Promise<Video> {
    const video = await videoRepository.update(id, data);
    if (!video) {
      throw new AppError("Vídeo não encontrado", 404);
    }
    return video;
  }

  async markAsViewed(videoId: string, userId: string, data: { watchDurationSeconds: number; completed: boolean }) {
    const video = await this.findById(videoId);
    if (!video) {
      throw new AppError('Vídeo não encontrado', 404);
    }

    const videoViewRepository = AppDataSource.getRepository(VideoView);

    // Procura por uma visualização existente
    let videoView = await videoViewRepository.findOne({
      where: { videoId, userId }
    });

    if (videoView) {
      // Atualiza a visualização existente
      videoView.watchDurationSeconds = data.watchDurationSeconds;
      videoView.completed = data.completed;
      videoView.viewedAt = new Date();
    } else {
      // Cria uma nova visualização
      videoView = videoViewRepository.create({
        videoId,
        userId,
        watchDurationSeconds: data.watchDurationSeconds,
        completed: data.completed
      });
    }

    return await videoViewRepository.save(videoView);
  }

  async getVideoViews(videoId: string, userId: string) {
    const videoViewRepository = AppDataSource.getRepository(VideoView);
    return await videoViewRepository.findOne({
      where: { videoId, userId }
    });
  }

  async removeVideoView(videoId: string, userId: string) {
    const videoViewRepository = AppDataSource.getRepository(VideoView);
    
    const videoView = await videoViewRepository.findOne({
      where: { videoId, userId }
    });

    if (!videoView) {
      throw new AppError('Visualização não encontrada', 404);
    }

    await videoViewRepository.remove(videoView);
  }

  async getTotalViews(videoId: string): Promise<number> {
    const videoViewRepository = AppDataSource.getRepository(VideoView);
    return await videoViewRepository.count({
      where: { videoId }
    });
  }
}

// Exporta uma instância única do serviço
export const videoService = new VideoService();
