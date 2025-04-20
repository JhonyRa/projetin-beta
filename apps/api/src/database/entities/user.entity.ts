// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

// @Entity('users')
// export class User {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   name: string;

//   @Column({ unique: true })
//   @Index('IDX_USER_EMAIL')
//   email: string;

//   @Column({
//     type: 'text',
//     enum: ['ADMIN', 'USER'],
//     default: 'USER'
//   })
//   role: 'ADMIN' | 'USER';

//   @Column({ default: true })
//   active: boolean;

//   @CreateDateColumn({ type: 'timestamp' })
//   createdAt: Date;

//   @UpdateDateColumn({ type: 'timestamp' })
//   updatedAt: Date;
// } 