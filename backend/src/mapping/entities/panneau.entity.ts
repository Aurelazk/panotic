import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { Point } from 'geojson';

export enum PanneauType {
  GRAND_FORMAT = 'grand_format',
  MOBILIER_URBAIN = 'mobilier_urbain',
  PETIT_FORMAT = 'petit_format',
  ENSEIGNE = 'enseigne',
}

export enum PanneauRegime {
  CONCESSION = 'concession',
  PRIVE = 'prive',
  PUBLIC = 'public',
}

export enum PanneauEtat {
  BON = 'bon',
  DEGRADE = 'degrade',
  A_REMPLACER = 'a_remplacer',
}

@Entity('panneaux')
export class Panneau {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column({ type: 'enum', enum: PanneauType })
  type: PanneauType;

  @Column({ nullable: true })
  format: string; // e.g. "12m2", "2m2"

  @Column({ type: 'enum', enum: PanneauRegime, default: PanneauRegime.PUBLIC })
  regime: PanneauRegime;

  @Column({ type: 'enum', enum: PanneauEtat, default: PanneauEtat.BON })
  etat: PanneauEtat;

  @Column({ default: 1 })
  faceCount: number;

  @Column({ default: false })
  estEclaire: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
