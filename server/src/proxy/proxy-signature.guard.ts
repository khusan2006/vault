import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import type { Request } from 'express';

@Injectable()
export class ProxySignatureGuard implements CanActivate {
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.apiSecret =
      this.configService.getOrThrow<string>('shopify.apiSecret');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const query = { ...request.query } as Record<string, string>;

    const signature = query.signature;
    if (!signature) {
      throw new UnauthorizedException('Missing proxy signature');
    }

    delete query.signature;

    const sortedParams = Object.keys(query)
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('');

    const computed = createHmac('sha256', this.apiSecret)
      .update(sortedParams)
      .digest('hex');

    if (computed !== signature) {
      throw new UnauthorizedException('Invalid proxy signature');
    }

    return true;
  }
}
