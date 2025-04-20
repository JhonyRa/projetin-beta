import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from "typeorm";
import { User } from "./User";
import { Video } from "./Video";

@Entity("video_views")
@Index("idx_video_views_video_id", ["videoId"])
@Index("idx_video_views_user_id", ["userId"])
@Index("idx_video_views_viewed_at", ["viewedAt"])
export class VideoView {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "video_id" })
  videoId: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ 
    name: "viewed_at",
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP"
  })
  viewedAt: Date;

  @Column({ 
    name: "watch_duration_seconds",
    default: 0
  })
  watchDurationSeconds: number;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn({ 
    name: "created_at",
    type: "timestamp with time zone" 
  })
  createdAt: Date;

  @ManyToOne(() => Video, video => video.videoViews)
  @JoinColumn({ name: "video_id" })
  video: Video;

  @ManyToOne(() => User, user => user.videoViews)
  @JoinColumn({ name: "user_id" })
  user: User;
} 