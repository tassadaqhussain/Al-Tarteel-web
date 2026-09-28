import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminBootstrapService } from './admin.bootstrap.service';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [AuthModule, AnalyticsModule, CampaignsModule, AnnouncementsModule],
  controllers: [AdminController],
  providers: [AdminService, AdminBootstrapService, AdminGuard],
})
export class AdminModule {}
