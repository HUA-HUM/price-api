import { ApiProperty } from '@nestjs/swagger';

class ProfitabilityDetailInputDto {
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

class ProfitabilityDetailPricesDto {
  @ApiProperty({ example: 100000 })
  salePrice: number;

  @ApiProperty({ example: 10 })
  meliContributionPercentage: number;

  @ApiProperty({ example: 10000 })
  meliContributionAmount: number;

  @ApiProperty({ example: 110000 })
  sellerNetPrice: number;
}

class ProfitabilityDatosBaseDto {
  @ApiProperty({ example: 'SKU123' })
  sku: string;

  @ApiProperty({ example: 10 })
  weightKg: number;

  @ApiProperty({ example: 12.87 })
  volumetricWeightKg: number;

  @ApiProperty({ example: 110000 })
  sellerNetPrice: number;

  @ApiProperty({ example: 'MLA002' })
  categoryId: string;
}

class ProfitabilityTiposDeCambioDto {
  @ApiProperty({ example: 1361.7 })
  tcAmco: number;

  @ApiProperty({ example: 1447.3 })
  tcTlq: number;
}

class ProfitabilityCostosOperativosDto {
  @ApiProperty({ example: 14 })
  commissionMpPercentage: number;

  @ApiProperty({ example: 11000 })
  envioMlAmount: number;

  @ApiProperty({ example: 95377.07 })
  precioAmzAmount: number;

  @ApiProperty({ example: 28946 })
  depositoUsaAmount: number;

  @ApiProperty({ example: 189123.63 })
  costosAmcoAmount: number;

  @ApiProperty({ example: 0 })
  imptosAmcoAmount: number;
}

class ProfitabilityEmoDto {
  @ApiProperty({ example: 0.21 })
  ivaCatAranc: number;

  @ApiProperty({ example: 0.4 })
  sumaTasasYDer: number;
}

class ProfitabilityCostosCalculadosDto {
  @ApiProperty({ example: 0 })
  utilidadAmount: number;

  @ApiProperty({ example: 14979.05 })
  impuestosMeliAmount: number;

  @ApiProperty({ example: 104853.36 })
  comisionMpAmount: number;
}

class ProfitabilityResultadosDto {
  @ApiProperty({ example: 444279.11 })
  totalCosts: number;

  @ApiProperty({ example: 304673.47 })
  operatingProfit: number;

  @ApiProperty({ example: '40.7%' })
  operatingProfitPercent: string;
}

class ProfitabilityPrecioDto {
  @ApiProperty({ example: 585091.07 })
  suggestedPrice: number;

  @ApiProperty({ example: '21.88%' })
  discount: string;
}

export class GetProfitabilityDetailsResponseDto {
  @ApiProperty({ type: ProfitabilityDetailInputDto })
  input: ProfitabilityDetailInputDto;

  @ApiProperty({ type: ProfitabilityDetailPricesDto })
  prices: ProfitabilityDetailPricesDto;

  @ApiProperty({ type: ProfitabilityDatosBaseDto })
  datosBase: ProfitabilityDatosBaseDto;

  @ApiProperty({ type: ProfitabilityTiposDeCambioDto })
  tiposDeCambio: ProfitabilityTiposDeCambioDto;

  @ApiProperty({ type: ProfitabilityCostosOperativosDto })
  costosOperativos: ProfitabilityCostosOperativosDto;

  @ApiProperty({ type: ProfitabilityEmoDto })
  emo: ProfitabilityEmoDto;

  @ApiProperty({ type: ProfitabilityCostosCalculadosDto })
  costosCalculados: ProfitabilityCostosCalculadosDto;

  @ApiProperty({ type: ProfitabilityResultadosDto })
  resultados: ProfitabilityResultadosDto;

  @ApiProperty({ type: ProfitabilityPrecioDto })
  precio: ProfitabilityPrecioDto;
}
