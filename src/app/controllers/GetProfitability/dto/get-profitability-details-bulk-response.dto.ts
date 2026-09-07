import { ApiProperty } from '@nestjs/swagger';
import { GetProfitabilityDetailsResponseDto } from './get-profitability-details-response.dto';

export class GetProfitabilityDetailsBulkResponseDto {
  @ApiProperty({
    type: [GetProfitabilityDetailsResponseDto],
    description:
      'Las posiciones se respetan: items[i] siempre corresponde al body[i] de la request. ' +
      'Un item que no se pudo calcular viene con status.resolved = false y valores en cero; ' +
      'esos ceros no son una medicion y no deberian usarse para decidir precios.',
  })
  items: GetProfitabilityDetailsResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  perPage: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
