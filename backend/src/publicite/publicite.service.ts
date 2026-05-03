import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AdCampaign, CampaignStatus } from './entities/ad-campaign.entity';
import { AdBooking } from './entities/ad-booking.entity';
import { Panneau } from '../mapping/entities/panneau.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PubliciteService {
  constructor(
    @InjectRepository(AdCampaign)
    private readonly campaignRepository: Repository<AdCampaign>,
    @InjectRepository(AdBooking)
    private readonly bookingRepository: Repository<AdBooking>,
    @InjectRepository(Panneau)
    private readonly panneauRepository: Repository<Panneau>,
  ) {}

  async createCampaign(authUser: { userId: string }, data: any): Promise<AdCampaign> {
    const campaign = this.campaignRepository.create({
      ...data,
      advertiser: { id: authUser.userId } as User,
      status: CampaignStatus.PENDING,
    });
    return this.campaignRepository.save(campaign as unknown as AdCampaign);
  }

  async getMyCampaigns(authUser: { userId: string }): Promise<AdCampaign[]> {
    return this.campaignRepository.find({
      where: { advertiser: { id: authUser.userId } },
      order: { createdAt: 'DESC' },
      relations: ['bookings', 'bookings.panneau'],
    });
  }

  async bookSlot(campaignId: string, panneauId: string, faceIndex: number = 0): Promise<AdBooking> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campagne non trouvée');

    const panneau = await this.panneauRepository.findOne({ where: { id: panneauId } });
    if (!panneau) throw new NotFoundException('Panneau non trouvé');

    // Basic availability check (simplified: no overlapping bookings for the same face/dates)
    const overlapping = await this.bookingRepository.createQueryBuilder('booking')
      .innerJoin('booking.campaign', 'campaign')
      .where('booking.panneauId = :panneauId', { panneauId })
      .andWhere('booking.faceIndex = :faceIndex', { faceIndex })
      .andWhere('campaign.startDate <= :endDate', { endDate: campaign.endDate })
      .andWhere('campaign.endDate >= :startDate', { startDate: campaign.startDate })
      .andWhere('campaign.status NOT IN (:...excluded)', { excluded: [CampaignStatus.REJECTED] })
      .getOne();

    if (overlapping) {
      throw new BadRequestException('Ce créneau est déjà réservé pour ce panneau.');
    }

    // Mock pricing: 50.000 FCFA for Grand Format, 15.000 for others
    const price = panneau.type === 'grand_format' ? 50000 : 15000;

    const booking = this.bookingRepository.create({
      campaign,
      panneau,
      faceIndex,
      price,
    });

    return this.bookingRepository.save(booking);
  }

  async getRecentCampaigns(): Promise<AdCampaign[]> {
    return this.campaignRepository.find({
      where: { status: CampaignStatus.ACTIVE },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['advertiser'],
    });
  }

  async approveCampaign(campaignId: string): Promise<AdCampaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campagne non trouvée');
    campaign.status = CampaignStatus.ACTIVE;
    return this.campaignRepository.save(campaign);
  }

  async rejectCampaign(campaignId: string): Promise<AdCampaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campagne non trouvée');
    campaign.status = CampaignStatus.REJECTED;
    return this.campaignRepository.save(campaign);
  }

  async getCampaignAnalytics(campaignId: string): Promise<any> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['bookings', 'bookings.panneau'],
    });
    if (!campaign) throw new NotFoundException('Campagne non trouvée');

    // Simulated analytics based on panel type and campaign duration
    const durationDays = campaign.endDate && campaign.startDate
      ? Math.max(1, Math.round((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 30;

    const impressionsPerDay = campaign.bookings?.reduce((acc: number, b: any) => {
      return acc + (b.panneau?.type === 'grand_format' ? 5000 : 1200);
    }, 0) || 0;

    return {
      campaignId,
      name: campaign.name,
      status: campaign.status,
      durationDays,
      totalImpressions: impressionsPerDay * durationDays,
      dailyImpressions: impressionsPerDay,
      engagementRate: (Math.random() * 3 + 1).toFixed(2) + '%',
      reach: Math.round(impressionsPerDay * durationDays * 0.6),
      spaces: campaign.bookings?.length || 0,
      budget: campaign.budget,
      costPerImpression: impressionsPerDay > 0
        ? (campaign.budget / (impressionsPerDay * durationDays)).toFixed(4)
        : '0',
    };
  }

  async getAllPendingCampaigns(): Promise<AdCampaign[]> {
    return this.campaignRepository.find({
      where: { status: CampaignStatus.PENDING },
      order: { createdAt: 'DESC' },
      relations: ['advertiser', 'bookings'],
    });
  }
}
