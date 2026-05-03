import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { Polygon } from 'geojson';

export enum ZoneType {
  COMMERCIALE = 'commerciale',
  RESIDENTIELLE = 'residentielle',
  SPECIALE = 'speciale',
  INTERDITE = 'interdite',
}

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  boundary: Polygon;

  @Column({ type: 'enum', enum: ZoneType, default: ZoneType.COMMERCIALE })
  type: ZoneType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.00 })
  tariffFactor: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
