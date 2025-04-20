import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  fatherFolderId: z.string().uuid().optional(),
  displayOrder: z.union([z.number().int(), z.null()]).optional().default(null),
  editorToAddIds: z.array(z.string().uuid()).optional(),
  editorToRemoveIds: z.array(z.string().uuid()).optional(),
});

export const updateFolderSchema = createFolderSchema.partial();

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;