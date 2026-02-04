import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';
import type { ConditionGroup, Benefit } from '../../common/types/index.js';
import type { CampaignStatus } from '../entities/campaign.entity.js';

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  conditions?: ConditionGroup;

  @IsOptional()
  @IsArray()
  benefits?: Benefit[];

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
