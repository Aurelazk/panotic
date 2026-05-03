import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PubliciteService } from './publicite.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('publicite')
export class PubliciteController {
  constructor(private readonly publiciteService: PubliciteService) {}

  @Post('campaigns')
  @UseGuards(JwtAuthGuard)
  createCampaign(@Req() req: any, @Body() data: any) {
    return this.publiciteService.createCampaign(req.user, data);
  }

  @Get('campaigns/me')
  @UseGuards(JwtAuthGuard)
  getMyCampaigns(@Req() req: any) {
    return this.publiciteService.getMyCampaigns(req.user);
  }

  @Post('bookings/:campaignId/:panneauId')
  @UseGuards(JwtAuthGuard)
  bookSlot(
    @Param('campaignId') campaignId: string,
    @Param('panneauId') panneauId: string,
    @Body('faceIndex') faceIndex?: number,
  ) {
    return this.publiciteService.bookSlot(campaignId, panneauId, faceIndex);
  }

  @Get('active')
  getRecentActiveCampaigns() {
    return this.publiciteService.getRecentCampaigns();
  }

  @Patch('campaigns/:id/approve')
  @UseGuards(JwtAuthGuard)
  approveCampaign(@Param('id') id: string) {
    return this.publiciteService.approveCampaign(id);
  }

  @Patch('campaigns/:id/reject')
  @UseGuards(JwtAuthGuard)
  rejectCampaign(@Param('id') id: string) {
    return this.publiciteService.rejectCampaign(id);
  }

  @Get('campaigns/:id/analytics')
  @UseGuards(JwtAuthGuard)
  getCampaignAnalytics(@Param('id') id: string) {
    return this.publiciteService.getCampaignAnalytics(id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  getPendingCampaigns() {
    return this.publiciteService.getAllPendingCampaigns();
  }
}
