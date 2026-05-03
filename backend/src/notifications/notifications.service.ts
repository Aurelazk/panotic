import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.repository.count();
    if (count === 0) {
      const users = await this.userRepository.find({ take: 1 });
      if (users.length > 0) {
        const user = users[0];
        const seedData = [
          {
            type: NotificationType.SIGNALEMENT,
            title: 'Signalement résolu',
            message: 'Le problème de panneau dégradé au carrefour Tobrouk a été réparé. Merci ! ✅',
            isRead: false,
          },
          {
            type: NotificationType.FORMATION,
            title: 'Nouvelle formation disponible',
            message: 'Un nouveau module sur la "Stratégie Ville Verte" vient d\'être publié. Découvrez-le dès maintenant ! 🌿',
            isRead: false,
          },
          {
            type: NotificationType.PUBLICITE,
            title: 'Campagne de proximité',
            message: 'Une nouvelle opportunité d\'affichage est disponible sur l\'Avenue Steinmetz.',
            isRead: true,
          }
        ];

        for (const data of seedData) {
          await this.create(user, data);
        }
      }
    }
  }

  async create(user: User, dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.repository.create({
      ...dto,
      user,
    });
    return this.repository.save(notification);
  }

  async findAll(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.repository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification non trouvée');
    notification.isRead = true;
    return this.repository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.update({ user: { id: userId }, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.count({
      where: { user: { id: userId }, isRead: false },
    });
  }
}
