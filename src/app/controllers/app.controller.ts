import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiKeyProtected } from '../security/api-key-protected.decorator';
import { Public } from '../security/public.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Chequeo simple de salud' })
  @ApiOkResponse({
    description: 'La API esta disponible',
    schema: {
      example: {
        status: 'ok',
      },
    },
  })
  health() {
    return { status: 'ok' };
  }

  @Get()
  @ApiKeyProtected()
  @ApiOperation({ summary: 'Endpoint protegido de ejemplo' })
  @ApiOkResponse({
    description: 'Respuesta de ejemplo para requests autenticados',
    schema: {
      example: {
        message: 'Price API protegida con API key',
      },
    },
  })
  root() {
    return { message: 'Price API protegida con API key' };
  }
}
