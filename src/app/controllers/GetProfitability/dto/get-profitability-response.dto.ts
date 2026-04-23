import { ApiProperty } from '@nestjs/swagger';

class ProfitabilityInputDto {
  @ApiProperty({
    example: 'MLA123456789',
    description: 'Identificador del item en Mercado Libre.',
  })
  mla: string;

  @ApiProperty({
    example: 'MLA002',
    description: 'Identificador de categoria de Mercado Libre.',
  })
  categoryId: string;

  @ApiProperty({
    example: 'gold_special',
    description: 'Tipo de publicacion de Mercado Libre.',
  })
  publicationType: string;

  @ApiProperty({
    example: 'SKU123',
    description: 'SKU interno del producto.',
  })
  sku: string;

  @ApiProperty({
    example: 100000,
    description: 'Precio de venta real informado en la request.',
  })
  salePrice: number;

  @ApiProperty({
    example: 10,
    description: 'Porcentaje de aporte de Mercado Libre sobre el precio de venta.',
  })
  meliContributionPercentage: number;
}

class ProfitabilityPricesDto {
  @ApiProperty({
    example: 100000,
    description: 'Precio de venta real del producto.',
  })
  salePrice: number;

  @ApiProperty({
    example: 10,
    description: 'Porcentaje de aporte de Mercado Libre.',
  })
  meliContributionPercentage: number;

  @ApiProperty({
    example: 10000,
    description: 'Monto aportado por Mercado Libre. Es la diferencia entre salePrice y sellerNetPrice.',
  })
  meliContributionAmount: number;

  @ApiProperty({
    example: 110000,
    description: 'Ingreso real considerado en la cuenta, ya incluyendo el aporte de Mercado Libre.',
  })
  sellerNetPrice: number;
}

class ProfitabilityEconomicsDto {
  @ApiProperty({
    example: 70000,
    description: 'Piso minimo de precio de venta sugerido para sostener la ganancia objetivo.',
  })
  cost: number;

  @ApiProperty({
    example: 40000,
    description: 'Ganancia en monto calculada como sellerNetPrice - cost.',
  })
  profitAmount: number;

  @ApiProperty({
    example: 21.87,
    description:
      'Porcentaje disponible entre sellerNetPrice y cost. Coincide con precio.discount del detalle. Formula: profitAmount / sellerNetPrice * 100.',
  })
  profitabilityPercent: number;

  @ApiProperty({
    example: 39.73,
    description:
      'Rentabilidad sobre costo. Formula: profitAmount / cost * 100.',
  })
  marginPercent: number;
}

class ProfitabilityStatusDto {
  @ApiProperty({
    example: true,
    description:
      'Indica si el producto pasa las validaciones de seguridad: peso mayor a 0, SKU con formato B0 + 8 caracteres alfanumericos y presencia de todos los datos clave del pricing.',
  })
  profitable: boolean;

  @ApiProperty({
    example: false,
    description:
      'Indica si deberia pausarse porque fallo alguna validacion de seguridad o falta algun dato clave del pricing.',
  })
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
