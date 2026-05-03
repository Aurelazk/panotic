import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
  Req,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(req) {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.AUTORITE) {
      throw new UnauthorizedException('Accès réservé aux administrateurs');
    }
  }

  @Get('stats')
  async getStats(@Req() req) {
    this.checkAdmin(req);
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(@Req() req) {
    this.checkAdmin(req);
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string, @Req() req) {
    this.checkAdmin(req);
    return this.adminService.updateUserRole(id, role as any);
  }

  @Patch('users/:id/badge')
  async updateBadge(@Param('id') id: string, @Body('badge') badge: string, @Req() req) {
    this.checkAdmin(req);
    return this.adminService.updateUserBadge(id, badge);
  }

  @Delete('ugc/:id')
  async deleteUgcPost(@Param('id') id: string, @Req() req) {
    this.checkAdmin(req);
    return this.adminService.deleteUgcPost(id);
  }

  @Get('export-csv')
  async exportCsv(@Req() req) {
    this.checkAdmin(req);
    return this.adminService.getExportCsvData();
  }
}
