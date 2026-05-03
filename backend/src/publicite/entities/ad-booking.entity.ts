import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { AdCampaign } from './ad-campaign.entity';
import { Panneau } from '../../mapping/entities/panneau.entity';

@Entity('ad_bookings')
export class AdBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AdCampaign, (campaign) => campaign.bookings, { onDelete: 'CASCADE' })
  campaign: AdCampaign;

  @ManyToOne(() => Panneau, (panneau) => panneau.id)
  panneau: Panneau;

  @Column({ default: 0 })
  faceIndex: number; // Face 1, 2, etc.

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;
}
