import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ConditionGroup, Benefit } from '../../common/types/index.js';
import type { CampaignStatus } from '../entities/campaign.entity.js';

export class CreateCampaignDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  conditions!: ConditionGroup;

  @IsArray()
  benefits!: Benefit[];

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
