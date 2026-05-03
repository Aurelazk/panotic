import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Formation } from './formation.entity';

@Unique(['user', 'formation'])
@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Formation)
  formation: Formation;

  // Index of the last completed phase (0-based)
  @Column({ default: 0 })
  currentPhaseIndex: number;

  // Index of the last completed step within the phase (0-based)
  @Column({ default: 0 })
  currentStepIndex: number;

  // Overall percentage (0-100)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercent: number;

  @Column({ default: false })
  quizPassed: boolean;

  @Column({ type: 'int', nullable: true })
  quizScore: number;

  @Column({ default: false })
  certificateGenerated: boolean;

  @Column({ nullable: true })
  certificateUrl: string;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  lastAccessedAt: Date;
}
