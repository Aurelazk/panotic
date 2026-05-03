import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignalementsController } from './signalements.controller';
import { SignalementsService } from './signalements.service';
import { Signalement } from './entities/signalement.entity';
import { Vote } from './entities/vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Signalement, Vote])],
  controllers: [SignalementsController],
  providers: [SignalementsService],
  exports: [SignalementsService],
})
export class SignalementsModule {}
