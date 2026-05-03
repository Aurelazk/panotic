import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdCampaign } from './entities/ad-campaign.entity';
import { AdBooking } from './entities/ad-booking.entity';
import { PubliciteService } from './publicite.service';
import { PubliciteController } from './publicite.controller';
import { Panneau } from '../mapping/entities/panneau.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdCampaign, AdBooking, Panneau]),
  ],
  providers: [PubliciteService],
  controllers: [PubliciteController],
  exports: [PubliciteService],
})
export class PubliciteModule {}
