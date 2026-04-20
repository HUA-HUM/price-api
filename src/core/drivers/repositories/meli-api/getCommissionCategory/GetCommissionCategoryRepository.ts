import { BadRequestException, Injectable } from '@nestjs/common';
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
  private readonly baseUrl = 'https://api.meli.loquieroaca.com';

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
      `${this.baseUrl}/meli/products/${params.mla}/commission`,
      {
        headers: {
          accept: 'application/json',
        },
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
}
