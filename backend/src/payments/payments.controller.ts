import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionPlan } from './entities/subscription.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('subscription')
  async getSubscription(@Req() req) {
    return this.paymentsService.getSubscription(req.user.userId);
  }

  @Post('upgrade')
  async upgrade(@Req() req, @Body('plan') plan: SubscriptionPlan) {
    // In a real scenario, this would initiate a payment first
    // For this implementation, we simulate successful payment and upgrade
    return this.paymentsService.upgradePlan(req.user.userId, plan);
  }

  @Post('mock-webhook')
  async mockWebhook(@Body('transactionId') id: string, @Body('plan') plan: SubscriptionPlan, @Req() req) {
    // Simulate provider callback confirming successful payment
    return this.paymentsService.upgradePlan(req.user.userId, plan);
  }
}
