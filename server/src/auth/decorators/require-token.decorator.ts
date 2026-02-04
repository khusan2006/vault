import { SetMetadata } from '@nestjs/common';

export const TOKEN_REQUIREMENTS_KEY = 'tokenRequirements';

export interface TokenRequirements {
  offline: boolean;
  online: boolean;
}

export const RequireOfflineToken = () =>
  SetMetadata(TOKEN_REQUIREMENTS_KEY, { offline: true, online: false } as TokenRequirements);

export const RequireOnlineToken = () =>
  SetMetadata(TOKEN_REQUIREMENTS_KEY, { offline: false, online: true } as TokenRequirements);

export const RequireBothTokens = () =>
  SetMetadata(TOKEN_REQUIREMENTS_KEY, { offline: true, online: true } as TokenRequirements);
