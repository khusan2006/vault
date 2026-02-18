import { Module } from '@nestjs/common';
import { SetupService } from './setup.service.js';
import { SetupController } from './setup.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { SessionModule } from '../session/session.module.js';
import { CampaignsModule } from '../campaigns/campaigns.module.js';

@Module({
  imports: [AuthModule, SessionModule, CampaignsModule],
  controllers: [SetupController],
  providers: [SetupService],
  exports: [SetupService],
})
export class SetupModule {}
