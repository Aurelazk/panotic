import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.usersService.findOneById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password: _p, ...safe } = user;
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    const updated = await this.usersService.update(req.user.userId, updateUserDto);
    if (!updated) {
      throw new UnauthorizedException();
    }
    const { password: _p, ...safe } = updated;
    return safe;
  }
}
