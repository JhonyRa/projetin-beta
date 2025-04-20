import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from "typeorm";
import { User } from "./User";
import { VideoView } from "./VideoView";
import { Folder } from "./Folder";

@Entity("videos")
@Index("idx_videos_folder_id", ["folderId"])
@Index("idx_videos_created_by_user_id", ["createdByUserId"])
export class Video {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "folder_id" })
  folderId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: "s3_key" })
  s3Key: string;

  @Column({ name: "thumbnail_url", nullable: true })
  thumbnailUrl: string;

  @Column({ name: "duration_seconds", nullable: true })
  durationSeconds: number;

  @Column({
    name: "display_order",
    type: "integer",
    nullable: true
  })
  displayOrder: number | null;

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

  @Column({ name: "created_by_user_id" })
  createdByUserId: string;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @ManyToOne(() => Folder, folder => folder.videos)
  @JoinColumn({ name: "folder_id" })
  folder: Folder;

  @ManyToOne(() => User, user => user.videos)
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser: User;

  @OneToMany(() => VideoView, view => view.video)
  videoViews: VideoView[];
} 