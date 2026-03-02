import { Body, Controller, Get, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import type { MeResponse, UserPublic } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users/me')
  async me(@CurrentUser() user: { id: string }): Promise<MeResponse> {
    const profile = await this.usersService.getCurrentUser(user.id);
    if (!profile) {
      throw new NotFoundException('User not found');
    }
    return { user: profile };
  }

  @Get('users/:id')
  async getById(@Param('id') id: string): Promise<UserPublic> {
    const profile = await this.usersService.getCurrentUser(id);
    if (!profile) {
      throw new NotFoundException('User not found');
    }
    return profile;
  }

  @Put('users/me')
  // Placeholder implementation; will be expanded with full profile update logic.
  // FR-9.4: Session management and profile updates.
  async updateMe(
    @CurrentUser() _user: { id: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _body: Partial<UserPublic>,
  ): Promise<{ status: 'not_implemented' }> {
    return { status: 'not_implemented' };
  }

  @Put('users/me/password')
  // Placeholder for password change endpoint, to be wired to AuthService.
  async changePassword(): Promise<{ status: 'not_implemented' }> {
    return { status: 'not_implemented' };
  }

  @Put('users/me/notification-preferences')
  // Placeholder for notification preferences; will be implemented with notifications module.
  async updateNotificationPreferences(): Promise<{ status: 'not_implemented' }> {
    return { status: 'not_implemented' };
  }
}

