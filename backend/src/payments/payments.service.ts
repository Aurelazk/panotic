import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';

export enum PaymentProvider {
  CINETPAY = 'cinetpay',
  STRIPE = 'stripe',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async upgradePlan(userId: string, plan: SubscriptionPlan): Promise<Subscription> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['subscription'] });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    let subscription = user.subscription;
    if (!subscription) {
      subscription = this.subscriptionRepository.create({
        user,
        plan,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    } else {
      subscription.plan = plan;
      subscription.startDate = new Date();
      subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      subscription.status = SubscriptionStatus.ACTIVE;
    }

    return this.subscriptionRepository.save(subscription);
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  // Skeleton for payment processing
  async initiatePayment(userId: string, amount: number, provider: PaymentProvider): Promise<string> {
    console.log(`Initiating ${amount} payment via ${provider} for user ${userId}`);
    return `payment_url_for_${provider}_${Math.random().toString(36).substring(7)}`;
  }

  async verifyPayment(transactionId: string, provider: PaymentProvider): Promise<PaymentStatus> {
    console.log(`Verifying payment ${transactionId} via ${provider}`);
    return PaymentStatus.SUCCESS;
  }
}
