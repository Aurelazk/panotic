import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Signalement } from './signalement.entity';

@Entity('votes')
@Unique(['user', 'signalement'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Signalement)
  signalement: Signalement;

  @Column({ type: 'enum', enum: ['confirm', 'reject'], default: 'confirm' })
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}
