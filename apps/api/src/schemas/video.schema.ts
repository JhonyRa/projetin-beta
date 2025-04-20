import { z } from 'zod';

// Schema para validar o arquivo de vídeo
const videoFileSchema = z.object({
  fieldname: z.literal('video'),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine((mime) => 
    ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(mime), 
    'Formato de vídeo não suportado. Use MP4, MOV ou AVI'
  ),
  buffer: z.instanceof(Buffer),
  size: z.number().refine(
    (size) => size <= 100 * 1024 * 1024, 
    'O arquivo deve ter no máximo 100MB'
  ),
});

// Schema para validar os dados do formulário
export const createVideoSchema = z.object({
  folderId: z.string().uuid('ID da pasta inválido').optional(),
  title: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
  description: z.string().optional(),
  displayOrder:z.any().transform((val) => {
    if (val === null || val === undefined || val === '') return 0;
    const parsed = Number(val);
    return isNaN(parsed) ? 0 : parsed;
  })
});

// Schema para validar a atualização de vídeo
export const updateVideoSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
  description: z.string().optional(),
  displayOrder: z.any().transform((val) => {
    if (val === null || val === undefined || val === '') return 0;
    const parsed = Number(val);
    return isNaN(parsed) ? 0 : parsed;
  })
});

// Schema completo para validar a requisição
export const uploadVideoSchema = z.object({
  body: createVideoSchema,
  file: videoFileSchema,
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
export type UploadVideoInput = z.infer<typeof uploadVideoSchema>; 