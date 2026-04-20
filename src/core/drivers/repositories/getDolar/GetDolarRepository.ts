import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IGetDolarRepository } from 'src/core/adapters/getDolar/IGetDolarRepository';
import { DolarEntity } from 'src/core/entitis/getDolar/DolarEntity';

type CriptoYaDolarResponse = {
  oficial?: {
    price?: number;
  };
  mep: {
    al30?: {
      '24hs'?: {
        price?: number;
      };
    };
    gd30?: {
      '24hs'?: {
        price?: number;
      };
    };
  };
};

@Injectable()
export class GetDolarRepository implements IGetDolarRepository {
  private readonly url = 'https://criptoya.com/api/dolar';

  async getOfficial(): Promise<DolarEntity> {
    const response = await axios.get<CriptoYaDolarResponse>(this.url, {
      headers: {
        accept: 'application/json',
      },
    });

    const buy = response.data.mep.al30?.['24hs']?.price;
    const sell = response.data.mep.gd30?.['24hs']?.price;
    const officialBuy = response.data.oficial?.price;

    if (
      typeof buy !== 'number' ||
      typeof sell !== 'number' ||
      typeof officialBuy !== 'number'
    ) {
      throw new Error(
        'No se pudo obtener la cotizacion MEP y oficial desde CriptoYa',
      );
    }

    return {
      buy,
      sell,
      officialBuy,
    };
  }
}
