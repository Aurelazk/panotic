import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Signalement } from '../signalements/entities/signalement.entity';
import { Formation } from '../formations/entities/formation.entity';
import { AdCampaign } from '../publicite/entities/ad-campaign.entity';
import { Post } from '../ugc/entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Signalement, Formation, AdCampaign, Post]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
