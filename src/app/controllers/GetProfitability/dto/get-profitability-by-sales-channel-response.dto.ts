import { ApiProperty } from '@nestjs/swagger';

class SalesChannelProfitabilityInputDto {
  @ApiProperty({ example: 'B0F47N62NN' })
  sku: string;

  @ApiProperty({ example: 731399 })
  salePrice: number;

  @ApiProperty({
    example: 'megatone',
    enum: ['megatone', 'fravega', 'oncity'],
  })
  salesChannel: string;
}

class SalesChannelProfitabilityPricesDto {
  @ApiProperty({ example: 731399 })
  salePrice: number;

  @ApiProperty({ example: 0 })
  meliContributionPercentage: number;

  @ApiProperty({ example: 0 })
  meliContributionAmount: number;

  @ApiProperty({ example: 731399 })
  sellerNetPrice: number;
}

class SalesChannelProfitabilityEconomicsDto {
  @ApiProperty({ example: 585091.07 })
  cost: number;

  @ApiProperty({ example: 146307.93 })
  profitAmount: number;

  @ApiProperty({
    example: 20.01,
    description:
      'Porcentaje disponible entre sellerNetPrice y cost. Coincide con precio.discount del detalle.',
  })
  profitabilityPercent: number;

  @ApiProperty({
    example: 25,
    description: 'Rentabilidad sobre costo. Formula: profitAmount / cost * 100.',
  })
  marginPercent: number;
}

class SalesChannelProfitabilityStatusDto {
  @ApiProperty({ example: true })
  profitable: boolean;

  @ApiProperty({ example: false })
  shouldPause: boolean;
}

export class GetProfitabilityBySalesChannelResponseDto {
  @ApiProperty({ type: SalesChannelProfitabilityInputDto })
  input: SalesChannelProfitabilityInputDto;

  @ApiProperty({ type: SalesChannelProfitabilityPricesDto })
  prices: SalesChannelProfitabilityPricesDto;

  @ApiProperty({ type: SalesChannelProfitabilityEconomicsDto })
  economics: SalesChannelProfitabilityEconomicsDto;

  @ApiProperty({ type: SalesChannelProfitabilityStatusDto })
  status: SalesChannelProfitabilityStatusDto;
}
