import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FormationCategory {
  PANNEAUTIQUE = 'panneautique',
  ENVIRONNEMENT = 'environnement',
  VIE_SAINE = 'vie_saine',
  INFRASTRUCTURE = 'infrastructure',
}

export interface FormationStep {
  title: string;
  points: string[];
}

export interface FormationPhase {
  title: string;
  steps: FormationStep[];
}

@Entity('formations')
export class Formation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: FormationCategory,
    default: FormationCategory.PANNEAUTIQUE,
  })
  category: FormationCategory;

  @Column({ type: 'jsonb', nullable: true })
  content: FormationPhase[];

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @Column({ nullable: true })
  duration: string;

  @Column({ type: 'int', default: 50 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  enrolledCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 'XOF' }) // FCFA
  currency: string;

  @Column({ default: true }) // Default to free for now
  isFree: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User, (user) => user.formations)
  @JoinTable()
  enrolledUsers: User[];
}
