import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import type { Point } from 'geojson';
import { User } from '../../users/entities/user.entity';

export enum SignalementType {
  DEGRADE = 'degrade',
  OBSOLETE = 'obsolete',
  DANGEREUX = 'dangereux',
  ILLEGAL = 'illegal',
  TRAVAUX = 'travaux',
  BON_ETAT = 'bon_etat',
}

export enum SignalementStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  RESOLVED = 'resolved',
}

@Entity('signalements')
export class Signalement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SignalementType })
  type: SignalementType;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ type: 'enum', enum: SignalementStatus, default: SignalementStatus.PENDING })
  status: SignalementStatus;

  @Column({ default: 0 })
  votesCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  author: User;
}
