import { z } from 'zod';
import { UserRole } from '../@types/enums';

export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  clerkId: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.GLOBAL_EDITOR, UserRole.USER]).optional().default(UserRole.USER),
});

export const updateUserSchema = createUserSchema.partial();

export const updateUserRoleSchema = z.object({
  role: z.enum([UserRole.ADMIN, UserRole.GLOBAL_EDITOR, UserRole.USER]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>; 
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;