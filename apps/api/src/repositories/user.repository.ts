import { Repository, ILike } from 'typeorm';
import { User } from '../database/entities/User';
import { AppDataSource } from '../database/config/database';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(data: CreateUserInput): Promise<User> {
    const user = this.repository.create(data);
    return await this.repository.save(user);
  }

  async findAll(search?: string): Promise<User[]> {
    if (!search) {
      return await this.repository.find();
    }
    return await this.repository.find({
      where: [
        { firstName: ILike(`%${search}%`) },
        { lastName: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) }
      ]
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOneBy({ email });
  }

  async findByParam(param: string, value: string): Promise<User | null> {
    return await this.repository.findOneBy({ [param]: value });
  }

  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    const result = await this.repository.update(id, data);
    if (result.affected === 0) return null;
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}

// Exporta uma instância única do repositório
export const userRepository = new UserRepository(); 