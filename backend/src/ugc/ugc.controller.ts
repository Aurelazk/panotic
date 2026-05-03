import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UgcService } from './ugc.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ugc')
export class UgcController {
  constructor(private readonly ugcService: UgcService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.ugcService.createPost(createPostDto, req.user);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 10,
    @Query('theme') theme?: string,
    @Query('sortBy') sortBy?: 'recent' | 'popular'
  ) {
    const [posts, total] = await this.ugcService.findAll(page, limit, theme, sortBy || 'recent');
    return { posts, total, page, lastPage: Math.ceil(total / limit) };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Param('id') id: string) {
    return { likesCount: await this.ugcService.toggleLike(id) };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Body('content') content: string, @Request() req: any) {
    return this.ugcService.addComment(id, content, req.user);
  }
}
