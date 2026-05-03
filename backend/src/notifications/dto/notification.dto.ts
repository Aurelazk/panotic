import { IsNotEmpty, IsEnum, IsBoolean, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  link?: string;
}

export class UpdateNotificationDto {
  @IsBoolean()
  isRead: boolean;
}
