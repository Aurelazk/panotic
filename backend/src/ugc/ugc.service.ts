import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostTheme } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class UgcService implements OnModuleInit {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    const existing = await this.postsRepository.count();
    if (existing === 0) {
      // Seed some representative posts
      const seedPosts = [
        {
          content: 'Saviez-vous que Panotic aide à réduire la pollution visuelle tout en modernisant nos abris-bus ? 🌿 #VilleVerte #Environnement',
          theme: PostTheme.ENVIRONMENT,
          likesCount: 24,
          mediaUrl: 'https://images.unsplash.com/photo-1449156059539-798052149959',
        },
        {
          content: 'Nouveau point de lavage mains installé près du grand marché ! Ensemble pour une ville saine. 💧 #Sante #Cotonou',
          theme: PostTheme.HEALTH,
          likesCount: 56,
          mediaUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
        },
        {
          content: 'Félicitations aux nouveaux agents certifiés en panneautique ! Plus de 100 participants ce mois-ci. 🎓 #Formation #Panotic',
          theme: PostTheme.FAMILY, // General community
          likesCount: 89,
          mediaUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655',
        },
      ];

      for (const p of seedPosts) {
        await this.postsRepository.save(this.postsRepository.create(p));
      }
    }
  }

  private readonly forbiddenWords = ['insulte', 'haine', 'violence'];

  private moderateContent(content: string) {
    const found = this.forbiddenWords.some(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
    if (found) {
      throw new BadRequestException('Le contenu contient des mots interdits.');
    }
  }

  async createPost(createPostDto: CreatePostDto, authUser: { userId: string }): Promise<Post> {
    this.moderateContent(createPostDto.content);

    const post = this.postsRepository.create({
      ...createPostDto,
      author: { id: authUser.userId } as User,
    });
    return this.postsRepository.save(post);
  }

  async findAll(page: number = 1, limit: number = 10, theme?: string, sortBy: 'recent' | 'popular' = 'recent'): Promise<[Post[], number]> {
    const query = this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor');

    if (sortBy === 'popular') {
      query.orderBy('post.likesCount', 'DESC');
    } else {
      query.orderBy('post.createdAt', 'DESC');
    }

    query.take(limit).skip((page - 1) * limit);

    if (theme) {
      query.andWhere('post.theme = :theme', { theme });
    }

    return query.getManyAndCount();
  }

  async addComment(postId: string, content: string, authUser: { userId: string }): Promise<Comment> {
    this.moderateContent(content);

    const post = await this.postsRepository.findOne({ where: { id: postId }, relations: ['author'] });
    if (!post) throw new BadRequestException('Post not found');

    const comment = this.commentsRepository.create({
      content,
      author: { id: authUser.userId } as User,
      post,
    });
    const saved = await this.commentsRepository.save(comment);

    if (post.author && post.author.id !== authUser.userId) {
      await this.notificationsService.create(post.author, {
        type: NotificationType.UGC,
        title: 'Nouveau commentaire',
        message: 'Quelqu\'un a commenté votre publication.',
        link: post.id,
      });
    }

    return saved;
  }

  async toggleLike(postId: string): Promise<number> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    
    post.likesCount += 1;
    await this.postsRepository.save(post);
    return post.likesCount;
  }
}
