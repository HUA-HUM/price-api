import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetProfitabilityRequestWithContributionDto {
  @ApiProperty({
    example: 'MLA123456789',
    description: 'Identificador del item en Mercado Libre',
  })
  mla: string;

  @ApiProperty({
    example: 'SKU123',
    description: 'SKU interno del producto',
  })
  sku: string;

  @ApiProperty({
    example: 100000,
    description: 'Precio final de venta al cliente',
  })
  salePrice: number;

  @ApiProperty({
    example: 10,
    description: 'Porcentaje de aporte de Mercado Libre',
  })
  meliContributionPercentage: number;
}

export class GetProfitabilityRequestWithoutContributionDto {
  @ApiProperty({
    example: 'MLA123456789',
    description: 'Identificador del item en Mercado Libre',
  })
  mla: string;

  @ApiProperty({
    example: 'SKU123',
    description: 'SKU interno del producto',
  })
  sku: string;

  @ApiProperty({
    example: 100000,
    description: 'Precio final de venta al cliente',
  })
  salePrice: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Porcentaje de aporte de Mercado Libre cuando aplica',
  })
  meliContributionPercentage?: number;
}
