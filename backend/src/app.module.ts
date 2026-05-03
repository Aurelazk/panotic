import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SignalementsModule } from './signalements/signalements.module';
import { MappingModule } from './mapping/mapping.module';
import { FormationsModule } from './formations/formations.module';
import { PubliciteModule } from './publicite/publicite.module';
import { UgcModule } from './ugc/ugc.module';
import { StorageModule } from './storage/storage.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME || 'panotic_user',
      password: process.env.DB_PASSWORD || 'panotic_password',
      database: process.env.DB_DATABASE || 'panotic_db',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: true, // Only for development
    }),
    AuthModule,
    UsersModule,
    SignalementsModule,
    MappingModule,
    FormationsModule,
    PubliciteModule,
    UgcModule,
    StorageModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
