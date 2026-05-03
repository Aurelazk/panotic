import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Signalement, SignalementStatus } from '../signalements/entities/signalement.entity';
import { Formation } from '../formations/entities/formation.entity';
import { AdCampaign, CampaignStatus } from '../publicite/entities/ad-campaign.entity';
import { Post } from '../ugc/entities/post.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Signalement)
    private readonly signalementRepository: Repository<Signalement>,
    @InjectRepository(Formation)
    private readonly formationRepository: Repository<Formation>,
    @InjectRepository(AdCampaign)
    private readonly campaignRepository: Repository<AdCampaign>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalSignalements,
      resolvedSignalements,
      totalFormations,
      totalEnrollments,
      activeCampaigns
    ] = await Promise.all([
      this.userRepository.count(),
      this.signalementRepository.count(),
      this.signalementRepository.count({ where: { status: SignalementStatus.RESOLVED } }),
      this.formationRepository.count(),
      this.formationRepository.createQueryBuilder('f').select('SUM(f.enrolledCount)', 'sum').getRawOne(),
      this.campaignRepository.count({ where: { status: CampaignStatus.ACTIVE } }),
    ]);

    return {
      users: { total: totalUsers },
      signalements: {
        total: totalSignalements,
        resolved: resolvedSignalements,
        percentageResolved: totalSignalements > 0 ? (resolvedSignalements / totalSignalements) * 100 : 0,
      },
      formations: {
        total: totalFormations,
        enrollments: parseInt(totalEnrollments?.sum || '0', 10),
      },
      publicite: {
        active: activeCampaigns,
      }
    };
  }

  async getAllUsers() {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'],
    });
  }

  async updateUserRole(userId: string, role: any) {
    await this.userRepository.update(userId, { role });
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateUserBadge(userId: string, badge: string) {
    await this.userRepository.update(userId, { badge });
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async deleteUgcPost(postId: string) {
    await this.postRepository.delete(postId);
    return { success: true };
  }

  async getExportCsvData() {
    const signalements = await this.signalementRepository.find({
      relations: ['author'],
    });

    let csvStr = "ID,Type,Statut,Auteur,Date\n";
    signalements.forEach(sig => {
      csvStr += `${sig.id},${sig.type},${sig.status},${sig.author?.email || 'N/A'},${sig.createdAt.toISOString()}\n`;
    });
    
    return { csv: csvStr };
  }
}
