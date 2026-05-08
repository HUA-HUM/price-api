import { ApiProperty } from '@nestjs/swagger';

export class GetProfitabilityBySalesChannelRequestDto {
  @ApiProperty({
    example: 'B0F47N62NN',
    description: 'SKU interno del producto.',
  })
  sku: string;

  @ApiProperty({
    example: 731399,
    description: 'Precio final de venta al cliente.',
  })
  salePrice: number;

  @ApiProperty({
    example: 'megatone',
    enum: ['megatone', 'fravega', 'oncity'],
    description: 'Canal de venta externo a Mercado Libre.',
  })
  salesChannel: 'megatone' | 'fravega' | 'oncity';
}
