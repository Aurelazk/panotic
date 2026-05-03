import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { UgcService } from './ugc.service';
import { UgcController } from './ugc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment])],
  providers: [UgcService],
  controllers: [UgcController],
  exports: [UgcService],
})
export class UgcModule {}
