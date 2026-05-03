import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from '../../ugc/entities/post.entity';
import { Comment } from '../../ugc/entities/comment.entity';
import { Formation } from '../../formations/entities/formation.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Subscription } from '../../payments/entities/subscription.entity';

export enum UserRole {
  CITOYEN = 'citoyen',
  PROFESSIONNEL = 'professionnel',
  REGIE = 'regie',
  FORMATEUR = 'formateur',
  AUTORITE = 'autorite',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CITOYEN })
  role: UserRole;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: 0 })
  points: number;

  @Column({ nullable: true })
  badge: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @ManyToMany(() => Formation, (formation) => formation.enrolledUsers)
  @JoinTable()
  formations: Formation[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription: Subscription;
}
