import { IsString, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { PostTheme } from '../entities/post.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Le contenu doit faire au moins 10 caractères' })
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsEnum(PostTheme)
  theme: PostTheme;
}
