import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Formation } from './entities/formation.entity';
import { UserProgress } from './entities/user-progress.entity';
import { User } from '../users/entities/user.entity';
import { FormationsService } from './formations.service';
import { FormationsController } from './formations.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Formation, User, UserProgress]),
    PaymentsModule,
  ],
  providers: [FormationsService],
  controllers: [FormationsController],
  exports: [FormationsService],
})
export class FormationsModule {}
