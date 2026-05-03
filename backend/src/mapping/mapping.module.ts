import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Panneau } from './entities/panneau.entity';
import { Zone } from './entities/zone.entity';
import { MappingService } from './mapping.service';
import { MappingController } from './mapping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Panneau, Zone])],
  providers: [MappingService],
  controllers: [MappingController],
  exports: [MappingService],
})
export class MappingModule {}
