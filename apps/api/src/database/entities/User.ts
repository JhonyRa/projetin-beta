import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from "typeorm";
import { Video } from "./Video";
import { VideoView } from "./VideoView";
import { FolderPermission } from "./FolderPermission";
import { Folder } from "./Folder";

@Entity("users")
@Index("idx_users_email", ["email"])
@Index("idx_users_clerk_id", ["clerkId"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: "first_name" })
  firstName: string;

  @Column({ name: "last_name" })
  lastName: string;

  @Column({ name: "clerk_id", unique: true, nullable: true})
  clerkId: string;

  @Column({
    type: "enum",
    enum: ["Admin", "Global Editor", "User"]
  })
  role: "Admin" | "Global Editor" | "User";

  @Column({ name: "is_active", default: true })
  isActive: boolean;

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

  @OneToMany(() => Folder, folder => folder.createdByUser)
  folders: Folder[];

  @OneToMany(() => FolderPermission, permission => permission.user)
  folderPermissions: FolderPermission[];

  @OneToMany(() => Video, video => video.createdByUser)
  videos: Video[];

  @OneToMany(() => VideoView, view => view.user)
  videoViews: VideoView[];
} 