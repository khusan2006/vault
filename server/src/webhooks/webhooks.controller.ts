import {
  Controller,
  Post,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service.js';
import { WebhookQueueService } from './webhook-queue.service.js';

@Controller('webhooks')
@SkipThrottle()
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly webhookQueueService: WebhookQueueService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() request: RawBodyRequest<Request>): Promise<{ received: boolean }> {
    const result = await this.webhooksService.validateWebhook(request);

    if (!result.valid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.logger.log(`Received webhook: ${result.topic} from ${result.shop}`);

    this.webhookQueueService.enqueue(
      result.topic!,
      result.shop!,
      result.payload,
      async () => {
        switch (result.topic) {
          case 'app/uninstalled':
            await this.webhooksService.handleAppUninstalled(result.shop!);
            break;

          default:
            this.logger.warn(`Unhandled webhook topic: ${result.topic}`);
        }
      },
    );

    return { received: true };
  }
}
