import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard.js';
import { ShopifyContext } from '../auth/decorators/shopify-context.decorator.js';
import type { ShopifyRequestContext } from '../auth/guards/shopify-auth.guard.js';
import { CampaignsService, CampaignListOptions } from './campaigns.service.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import type { CampaignStatus } from './entities/campaign.entity.js';
import type { CampaignType } from '../common/types/index.js';

@Controller('api/campaigns')
@UseGuards(ShopifyAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(
    @ShopifyContext() ctx: ShopifyRequestContext,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(ctx.shop, dto);
  }

  @Get()
  findAll(
    @ShopifyContext() ctx: ShopifyRequestContext,
    @Query('status') status?: CampaignStatus,
    @Query('type') type?: CampaignType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const options: CampaignListOptions = {
      status,
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };
    return this.campaignsService.findAll(ctx.shop, options);
  }

  @Get(':id')
  findOne(
    @ShopifyContext() ctx: ShopifyRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.campaignsService.findOne(ctx.shop, id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @ShopifyContext() ctx: ShopifyRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(ctx.shop, id, dto);
  }

  @Delete(':id')
  remove(
    @ShopifyContext() ctx: ShopifyRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.campaignsService.remove(ctx.shop, id);
  }

  @Post(':id/duplicate')
  duplicate(
    @ShopifyContext() ctx: ShopifyRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.campaignsService.duplicate(ctx.shop, id);
  }
}
