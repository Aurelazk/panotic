import { IsEnum, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { SignalementType } from '../entities/signalement.entity';

export class CreateSignalementDto {
  @IsEnum(SignalementType)
  type: SignalementType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;
}
