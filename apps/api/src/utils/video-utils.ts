import ffmpeg from 'fluent-ffmpeg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

export async function generateThumbnail(videoBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const thumbnailFileName = `thumbnails/${Date.now()}.jpg`;
    const s3Client = new S3Client({ 
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    });
    
    // Criar arquivo temporário para o vídeo
    const tempVideoPath = path.join('/tmp', `temp-${Date.now()}.mp4`);
    fs.writeFileSync(tempVideoPath, videoBuffer);

    ffmpeg(tempVideoPath)
      .screenshots({
        count: 1,
        folder: '/tmp',
        filename: 'thumbnail.jpg',
        size: '320x240',
      })
      .on('end', async () => {
        try {
          // Upload thumbnail to S3
          await s3Client.send(
            new PutObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: thumbnailFileName,
              Body: fs.readFileSync('/tmp/thumbnail.jpg'),
              ContentType: 'image/jpeg',
            })
          );
          
          // Limpar arquivos temporários
          fs.unlinkSync(tempVideoPath);
          fs.unlinkSync('/tmp/thumbnail.jpg');
          
          resolve(thumbnailFileName);
        } catch (error) {
          // Limpar arquivos temporários em caso de erro
          if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
          if (fs.existsSync('/tmp/thumbnail.jpg')) fs.unlinkSync('/tmp/thumbnail.jpg');
          
          reject(error);
        }
      })
      .on('error', (err) => {
        // Limpar arquivo temporário em caso de erro
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        reject(err);
      });
  });
} 