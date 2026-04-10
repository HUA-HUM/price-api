import { ApiProperty } from '@nestjs/swagger';

class ProfitabilityInputDto {
  @ApiProperty({ example: 'MLA123456789' })
  mla: string;

  @ApiProperty({ example: 'MLA002' })
  categoryId: string;

  @ApiProperty({ example: 'gold_special' })
  publicationType: string;

  @ApiProperty({ example: 'SKU123' })
  sku: string;

  @ApiProperty({ example: 100000 })
  salePrice: number;

  @ApiProperty({ example: 10 })
  meliContributionPercentage: number;
}

class ProfitabilityPricesDto {
  @ApiProperty({ example: 100000 })
  salePrice: number;

  @ApiProperty({ example: 10 })
  meliContributionPercentage: number;

  @ApiProperty({ example: 10000 })
  meliContributionAmount: number;

  @ApiProperty({ example: 110000 })
  sellerNetPrice: number;
}

class ProfitabilityEconomicsDto {
  @ApiProperty({ example: 70000 })
  cost: number;

  @ApiProperty({ example: 40000 })
  profitAmount: number;

  @ApiProperty({ example: 57.14 })
  profitabilityPercent: number;

  @ApiProperty({ example: 36.36 })
  marginPercent: number;
}

class ProfitabilityStatusDto {
  @ApiProperty({ example: true })
  profitable: boolean;

  @ApiProperty({ example: false })
  shouldPause: boolean;
}

export class GetProfitabilityResponseDto {
  @ApiProperty({ type: ProfitabilityInputDto })
  input: ProfitabilityInputDto;

  @ApiProperty({ type: ProfitabilityPricesDto })
  prices: ProfitabilityPricesDto;

  @ApiProperty({ type: ProfitabilityEconomicsDto })
  economics: ProfitabilityEconomicsDto;

  @ApiProperty({ type: ProfitabilityStatusDto })
  status: ProfitabilityStatusDto;
}
