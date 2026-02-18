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
  CampaignConfig,
} from '../../common/types/index.js';
import type { CampaignStatus } from '../entities/campaign.entity.js';

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @ValidateIf((_, value) => value !== undefined)
  @IsObject()
  conditions?: ConditionGroup;

  @IsOptional()
  @IsObject()
  config?: CampaignConfig;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsEnum(['draft', 'active', 'paused', 'archived'])
  status?: CampaignStatus;

  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @IsOptional()
  @IsDateString()
  endsAt?: string | null;
}
