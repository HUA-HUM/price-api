import { ApiProperty } from '@nestjs/swagger';
import { GetProfitabilityDetailsResponseDto } from './get-profitability-details-response.dto';

export class GetProfitabilityDetailsBulkResponseDto {
  @ApiProperty({ type: [GetProfitabilityDetailsResponseDto] })
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
