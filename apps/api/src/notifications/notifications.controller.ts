import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import type { Notification } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  async list(
    @CurrentUser() user: { id: string },
  ): Promise<Notification[]> {
    return this.notificationsService.listForUser(user.id);
  }

  @Put('notifications/:id/read')
  async markRead(
    @Param('id') notificationId: string,
    @CurrentUser() user: { id: string },
  ): Promise<Notification> {
    return this.notificationsService.markRead(notificationId, user.id);
  }

  @Put('notifications/read-all')
  async markAllRead(
    @CurrentUser() user: { id: string },
  ): Promise<{ status: 'ok' }> {
    await this.notificationsService.markAllRead(user.id);
    return { status: 'ok' };
  }
}

