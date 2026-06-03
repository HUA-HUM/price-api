import { ApiProperty } from '@nestjs/swagger';
import { GetProfitabilityBySalesChannelDetailsResponseDto } from './get-profitability-by-sales-channel-details-response.dto';

export class GetProfitabilityBySalesChannelDetailsBulkResponseDto {
  @ApiProperty({ type: [GetProfitabilityBySalesChannelDetailsResponseDto] })
  items: GetProfitabilityBySalesChannelDetailsResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  perPage: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
