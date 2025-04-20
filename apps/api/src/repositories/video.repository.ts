import { Repository } from 'typeorm';
import { Video } from '../database/entities/Video';
import { CreateVideoInput } from '../schemas/video.schema';
import { AppDataSource } from '../database/config/database';

class VideoRepository {
  private repository: Repository<Video>;

  constructor() {
    this.repository = AppDataSource.getRepository(Video);
  }

  async create(data: Video): Promise<Video> {
    const video = this.repository.create(data);
    return await this.repository.save(video);
  }

  async findById(id: string): Promise<Video | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByFolderId(folderId: string): Promise<Video[]> {
    return await this.repository.find({ 
      where: { folderId, isActive: true },
      order: { displayOrder: 'ASC' }
    });
  }

  async update(id: string, data: Partial<Video>): Promise<Video | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return result.affected ? result.affected > 0 : false;
  }
}

export const videoRepository = new VideoRepository(); 