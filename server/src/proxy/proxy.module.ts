import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller.js';
import { ProxySignatureGuard } from './proxy-signature.guard.js';
import { EvaluationModule } from '../evaluation/evaluation.module.js';

@Module({
  imports: [EvaluationModule],
  controllers: [ProxyController],
  providers: [ProxySignatureGuard],
})
export class ProxyModule {}
