import { userRepository } from '../repositories/user.repository';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { User } from '../database/entities/User';
import { AppError } from '../errors/app-error';
import { UserRole } from '../@types/enums';

export class UserService {
  async create(data: CreateUserInput): Promise<User> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) return existingUser;
    return await userRepository.create(data);
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return await userRepository.findByParam("clerkId", clerkId);
  }

  async findAll(search?: string): Promise<User[]> {
    return await userRepository.findAll(search);
  }

  async findById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    return user;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const user = await userRepository.update(id, data);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    return user;
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    
    const updatedUser = await userRepository.update(id, { role });
    if (!updatedUser) {
      throw new AppError('Erro ao atualizar o papel do usuário', 500);
    }
    
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new AppError('Usuário não encontrado', 404);
    }
  }
}

// Exporta uma instância única do serviço
export const userService = new UserService();