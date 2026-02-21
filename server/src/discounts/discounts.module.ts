import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '../campaigns/entities/campaign.entity.js';
import { EvaluationModule } from '../evaluation/evaluation.module.js';
import { SessionModule } from '../session/session.module.js';
import { TimerSaleCode } from './entities/timer-sale-code.entity.js';
import { TimerSaleCodesService } from './timer-sale-codes.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimerSaleCode, Campaign]),
    EvaluationModule,
    SessionModule,
  ],
  providers: [TimerSaleCodesService],
  exports: [TimerSaleCodesService],
})
export class DiscountsModule {}
