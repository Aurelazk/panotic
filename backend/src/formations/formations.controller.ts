import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import { FormationsService } from './formations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return this.formationsService.findAll(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.formationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/enroll')
  async enroll(
    @Param('id') id: string,
    @Request() req: any,
    @Body() metadata?: { transactionId?: string; provider?: any }
  ) {
    return this.formationsService.enroll(id, req.user, metadata);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/progress')
  async getProgress(@Param('id') id: string, @Request() req: any) {
    return this.formationsService.getProgress(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { phaseIndex: number; stepIndex: number },
  ) {
    return this.formationsService.updateProgress(id, req.user.userId, body.phaseIndex, body.stepIndex);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/quiz')
  async submitQuiz(
    @Param('id') id: string,
    @Request() req: any,
    @Body('answers') answers: number[],
  ) {
    return this.formationsService.submitQuiz(id, req.user.userId, answers);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/certificate')
  async getCertificate(@Param('id') id: string, @Request() req: any) {
    const url = await this.formationsService.generateCertificate(id, req.user.userId);
    return { certificateUrl: url };
  }
}
