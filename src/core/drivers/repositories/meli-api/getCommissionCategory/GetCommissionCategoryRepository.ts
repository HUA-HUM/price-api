import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  GetCommissionCategoryParams,
  IGetCommissionCategoryRepository,
} from 'src/core/adapters/meli-api/getCommissionCategory/IGetCommissionCategoryRepository';
import { MeliCommissionCategoryEntity } from 'src/core/entitis/meli-api/getCommissionCategory/MeliCommissionCategory';

type MeliCommissionApiResponse = {
  percentage?: number;
  percentage_fee?: number;
  fixed_fee?: number | null;
  fixed_fee_amount?: number | null;
  gross_amount?: number | null;
  sale_fee_amount?: number | null;
  sale_fee_details?: {
    percentage_fee?: number;
    fixed_fee?: number | null;
    gross_amount?: number | null;
  };
};

@Injectable()
export class GetCommissionCategoryRepository
  implements IGetCommissionCategoryRepository
{
  constructor(private readonly configService: ConfigService) {}

  async getByProduct(
    params: GetCommissionCategoryParams,
  ): Promise<MeliCommissionCategoryEntity> {
    if (!params.mla?.trim()) {
      throw new BadRequestException('mla is required');
    }

    if (typeof params.price !== 'number' || params.price <= 0) {
      throw new BadRequestException('price must be a number greater than 0');
    }

    if (!params.categoryId?.trim()) {
      throw new BadRequestException('categoryId is required');
    }

    if (!params.listingTypeId?.trim()) {
      throw new BadRequestException('listingTypeId is required');
    }

    const response = await axios.get<MeliCommissionApiResponse>(
      `${this.getBaseUrl()}/meli/products/${params.mla}/commission`,
      {
        headers: this.getHeaders(),
        params: {
          price: params.price,
          category_id: params.categoryId,
          listing_type_id: params.listingTypeId,
        },
      },
    );

    return {
      percentage:
        response.data.percentage ??
        response.data.percentage_fee ??
        response.data.sale_fee_details?.percentage_fee ??
        0,
      fixedFee:
        response.data.fixed_fee ??
        response.data.fixed_fee_amount ??
        response.data.sale_fee_details?.fixed_fee ??
        null,
      grossAmount:
        response.data.gross_amount ??
        response.data.sale_fee_amount ??
        response.data.sale_fee_details?.gross_amount ??
        null,
    };
  }

  private getBaseUrl(): string {
    return (
      this.configService.get<string>('MELI_API_BASE_URL') ??
      'https://api.meli.loquieroaca.com'
    );
  }

  private getHeaders(): Record<string, string> {
    const apiKey = this.configService.get<string>('MELI_API_KEY');
    const apiKeyHeader =
      this.configService.get<string>('MELI_API_KEY_HEADER') ?? 'x-api-key';

    return {
      accept: 'application/json',
      ...(apiKey ? { [apiKeyHeader]: apiKey } : {}),
    };
  }
}
