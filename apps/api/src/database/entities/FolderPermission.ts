import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  DeleteDateColumn
} from "typeorm";
import { User } from "./User";
import { Folder } from "./Folder";

@Entity("folder_permissions")
@Index("idx_folder_permissions_folder_id", ["folderId"])
@Index("idx_folder_permissions_user_id", ["userId"])
@Index("idx_folder_permissions_granted_by", ["grantedByUserId"])
export class FolderPermission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "folder_id" })
  folderId: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({
    name: "permission_type",
    type: "enum",
    enum: ["editor", "viewer"]
  })
  permissionType: "editor" | "viewer";

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

  @Column({ name: "granted_by_user_id" })
  grantedByUserId: string;

  @ManyToOne(() => Folder, folder => folder.folderPermissions)
  @JoinColumn({ name: "folder_id" })
  folder: Folder;

  @ManyToOne(() => User, user => user.folderPermissions)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "granted_by_user_id" })
  grantedByUser: User;
} 