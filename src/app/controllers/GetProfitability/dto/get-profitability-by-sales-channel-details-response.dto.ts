import { ApiProperty } from '@nestjs/swagger';

class SalesChannelDetailInputDto {
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

class SalesChannelDetailPricesDto {
  @ApiProperty({ example: 731399 })
  salePrice: number;

  @ApiProperty({ example: 0 })
  meliContributionPercentage: number;

  @ApiProperty({ example: 0 })
  meliContributionAmount: number;

  @ApiProperty({ example: 731399 })
  sellerNetPrice: number;
}

class SalesChannelDatosBaseDto {
  @ApiProperty({ example: 'B0F47N62NN' })
  sku: string;

  @ApiProperty({ example: 2.5 })
  weightKg: number;

  @ApiProperty({ example: 4.12 })
  volumetricWeightKg: number;

  @ApiProperty({ example: 731399 })
  sellerNetPrice: number;

  @ApiProperty({ example: 'MLA31040' })
  categoryId: string;
}

class SalesChannelTiposDeCambioDto {
  @ApiProperty({ example: 1361.7 })
  tcAmco: number;

  @ApiProperty({ example: 1447.3 })
  tcTlq: number;
}

class SalesChannelCostosOperativosDto {
  @ApiProperty({ example: 18.15 })
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

class SalesChannelEmoDto {
  @ApiProperty({ example: 0.21 })
  ivaCatAranc: number;

  @ApiProperty({ example: 0.4 })
  sumaTasasYDer: number;
}

class SalesChannelCostosCalculadosDto {
  @ApiProperty({ example: 0 })
  utilidadAmount: number;

  @ApiProperty({ example: 14979.05 })
  impuestosMeliAmount: number;

  @ApiProperty({ example: 104853.36 })
  comisionMpAmount: number;
}

class SalesChannelResultadosDto {
  @ApiProperty({ example: 444279.11 })
  totalCosts: number;

  @ApiProperty({ example: 304673.47 })
  operatingProfit: number;

  @ApiProperty({ example: '40.7%' })
  operatingProfitPercent: string;
}

class SalesChannelPrecioDto {
  @ApiProperty({ example: 585091.07 })
  suggestedPrice: number;

  @ApiProperty({ example: '21.88%' })
  discount: string;
}

class SalesChannelDetailStatusDto {
  @ApiProperty({ example: true })
  profitable: boolean;

  @ApiProperty({ example: false })
  shouldPause: boolean;
}

export class GetProfitabilityBySalesChannelDetailsResponseDto {
  @ApiProperty({ type: SalesChannelDetailInputDto })
  input: SalesChannelDetailInputDto;

  @ApiProperty({ type: SalesChannelDetailPricesDto })
  prices: SalesChannelDetailPricesDto;

  @ApiProperty({ type: SalesChannelDatosBaseDto })
  datosBase: SalesChannelDatosBaseDto;

  @ApiProperty({ type: SalesChannelTiposDeCambioDto })
  tiposDeCambio: SalesChannelTiposDeCambioDto;

  @ApiProperty({ type: SalesChannelCostosOperativosDto })
  costosOperativos: SalesChannelCostosOperativosDto;

  @ApiProperty({ type: SalesChannelEmoDto })
  emo: SalesChannelEmoDto;

  @ApiProperty({ type: SalesChannelCostosCalculadosDto })
  costosCalculados: SalesChannelCostosCalculadosDto;

  @ApiProperty({ type: SalesChannelResultadosDto })
  resultados: SalesChannelResultadosDto;

  @ApiProperty({ type: SalesChannelPrecioDto })
  precio: SalesChannelPrecioDto;

  @ApiProperty({ type: SalesChannelDetailStatusDto })
  status: SalesChannelDetailStatusDto;
}
