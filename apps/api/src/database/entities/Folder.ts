import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  DeleteDateColumn
} from "typeorm";
import { User } from "./User";
import { FolderPermission } from "./FolderPermission";
import { Video } from "./Video";

@Entity("folders")
@Index("idx_folders_father_folder_id", ["fatherFolderId"])
@Index("idx_folders_created_by_user_id", ["createdByUserId"])
export class Folder {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "father_folder_id", nullable: true, type: "uuid" })
  fatherFolderId: string | null;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: "display_order", type: "integer", nullable: true })
  displayOrder: number | null;

  @Column({ name: "created_by_user_id" })
  createdByUserId: string;

  @CreateDateColumn({ 
    name: "created_at",
    type: "timestamp with time zone" 
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    name: "updated_at",
    type: "timestamp with time zone" 
  })
  updatedAt: Date;

  @DeleteDateColumn({ 
    name: "deleted_at",
    type: "timestamp with time zone" 
  })
  deletedAt: Date | null;

  @ManyToOne(() => Folder, folder => folder.childFolders)
  @JoinColumn({ name: "father_folder_id" })
  fatherFolder: Folder;

  @OneToMany(() => Folder, folder => folder.fatherFolder)
  childFolders: Folder[];

  @ManyToOne(() => User, user => user.folders)
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser: User;

  @OneToMany(() => FolderPermission, permission => permission.folder)
  folderPermissions: FolderPermission[];

  @OneToMany(() => Video, video => video.folder)
  videos: Video[];
} 