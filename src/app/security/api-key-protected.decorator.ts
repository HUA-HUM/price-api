import { applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export function ApiKeyProtected() {
  return applyDecorators(ApiSecurity('api-key'));
}
