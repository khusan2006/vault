import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  IsObject,
  Min,
  ValidateIf,
} from 'class-validator';
import type {
  ConditionGroup,
  CampaignType,
  CampaignConfig,
} from '../../common/types/index.js';
import type { CampaignStatus } from '../entities/campaign.entity.js';

export class CreateCampaignDto {
  @IsEnum(['early_access', 'discounted_product', 'timer_sale'])
  type!: CampaignType;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsObject()
  conditions?: ConditionGroup;

  @IsObject()
  config!: CampaignConfig;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsEnum(['draft', 'active', 'paused', 'archived'])
  status?: CampaignStatus;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
