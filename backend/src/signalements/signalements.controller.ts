import { Controller, Post, Get, Param, Body, UsePipes, ValidationPipe, Query, UseGuards, Res } from '@nestjs/common';
import { SignalementsService } from './signalements.service';
import { CreateSignalementDto } from './dto/create-signalement.dto';
import { Signalement } from './entities/signalement.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import * as express from 'express';

@Controller('signalements')
export class SignalementsController {
  constructor(private readonly signalementsService: SignalementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createSignalementDto: CreateSignalementDto): Promise<Signalement> {
    return this.signalementsService.create(createSignalementDto);
  }

  @Get('heatmap')
  getHeatmapData(): Promise<{ latitude: number; longitude: number; weight: number }[]> {
    return this.signalementsService.getHeatmapData();
  }

  @Get()
  findAll(@Query('type') type?: string): Promise<Signalement[]> {
    return this.signalementsService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Signalement | null> {
    return this.signalementsService.findOne(id);
  }

  @Get(':id/report')
  async downloadReport(@Param('id') id: string, @Res() res: express.Response) {
    const buffer = await this.signalementsService.generateReport(id);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=signalement-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  vote(
    @Param('id') id: string,
    @GetUser() user: { userId: string },
    @Body('type') type: 'confirm' | 'reject',
  ): Promise<Signalement> {
    return this.signalementsService.vote(id, user, type);
  }
}
