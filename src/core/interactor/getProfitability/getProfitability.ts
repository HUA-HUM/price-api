import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { calculateCostosCalculados } from './calculators/calculateCostosCalculados';
import { calculateDatosBase } from './calculators/calculateDatosBase';
import { calculateEmo } from './calculators/calculateEmo';
import { calculatePrecio } from './calculators/calculatePrecio';
import { calculateResultados } from './calculators/calculateResultados';
import { calculateCostosOperativos } from './calculators/calculateCostosOperativos';
import { calculateValorDolar } from './calculators/calculateValorDolar';
import { GetCommissionCategoryInteractor } from './fetchers/getCommissionCategory';

import { GetDolarValueInteractor } from './fetchers/getDolarValue';
import { GetPriceSkuInteractor } from './fetchers/getPriceSku';
import { GetTaxesInteractor } from './fetchers/getTaxes';
import {
  GetProfitabilityDetailedResult,
  GetProfitabilityRequest,
  PricingFetchersResult,
} from './getProfitability.types';
import { GetProfitabilityResponseDto } from 'src/app/controllers/GetProfitability/dto/get-profitability-response.dto';

@Injectable()
export class GetProfitabilityInteractor {
  private static readonly MAX_ALLOWED_PROFITABILITY_PERCENT = 45;
  private static readonly VALID_SKU_PATTERN = /^B0[A-Z0-9]{8}$/;

  private readonly logger = new Logger(GetProfitabilityInteractor.name);

  constructor(
    private readonly getPriceSkuInteractor: GetPriceSkuInteractor,
    private readonly getDolarValueInteractor: GetDolarValueInteractor,
    private readonly getTaxesInteractor: GetTaxesInteractor,
    private readonly getCommissionCategoryInteractor: GetCommissionCategoryInteractor,
  ) {}

  async execute(
    body: GetProfitabilityRequest,
  ): Promise<GetProfitabilityResponseDto> {
    const detail = await this.executeDetailed(body);
    const cost = detail.precio.suggestedPrice;
    const profitAmount = Number(
      (detail.prices.sellerNetPrice - cost).toFixed(2),
    );
    const profitabilityPercent =
      detail.prices.sellerNetPrice > 0
        ? Number(
            ((profitAmount / detail.prices.sellerNetPrice) * 100).toFixed(2),
          )
        : 0;
    const marginPercent =
      cost > 0 ? Number(((profitAmount / cost) * 100).toFixed(2)) : 0;
    const profitable = this.isProfitable({
      detail,
      cost,
      profitabilityPercent,
    });

    return {
      input: detail.input,
      prices: detail.prices,
      economics: {
        cost,
        profitAmount,
        profitabilityPercent,
        marginPercent,
      },
      status: {
        profitable,
        shouldPause: !profitable,
      },
    };
  }

  private isProfitable({
    detail,
    cost,
    profitabilityPercent,
  }: {
    detail: GetProfitabilityDetailedResult;
    cost: number;
    profitabilityPercent: number;
  }): boolean {
    if (
      detail.datosBase.weightKg <= 0 ||
      detail.datosBase.volumetricWeightKg <= 0
    ) {
      this.logger.warn(
        `Product marked as not profitable because weight is missing or zero: ${JSON.stringify({
          sku: detail.input.sku,
          weightKg: detail.datosBase.weightKg,
          volumetricWeightKg: detail.datosBase.volumetricWeightKg,
        })}`,
      );
      return false;
    }

    if (!GetProfitabilityInteractor.VALID_SKU_PATTERN.test(detail.input.sku)) {
      this.logger.warn(
        `Product marked as not profitable because sku has an invalid format: ${detail.input.sku}`,
      );
      return false;
    }

    if (
      profitabilityPercent >
      GetProfitabilityInteractor.MAX_ALLOWED_PROFITABILITY_PERCENT
    ) {
      this.logger.warn(
        `Product marked as not profitable because profitability is above the safety threshold: ${JSON.stringify({
          sku: detail.input.sku,
          profitabilityPercent,
          maxAllowedProfitabilityPercent:
            GetProfitabilityInteractor.MAX_ALLOWED_PROFITABILITY_PERCENT,
        })}`,
      );
      return false;
    }

    return detail.prices.sellerNetPrice > cost;
  }

  async executeDetailed(
    body: GetProfitabilityRequest,
  ): Promise<GetProfitabilityDetailedResult> {
    const productStatus = await this.getPriceSkuInteractor.execute(body.sku);

    if (!productStatus) {
      throw new NotFoundException(
        `No product status found for sku ${body.sku}`,
      );
    }

    const officialDolar = await this.getDolarValueInteractor.execute();
    const taxes = await this.getTaxesInteractor.execute(body.categoryId);

    const commissionCategory =
      await this.getCommissionCategoryInteractor.execute({
        mla: body.mla,
        price: body.salePrice,
        categoryId: body.categoryId,
        listingTypeId: body.publicationType,
      });

    const fetchers: PricingFetchersResult = {
      body,
      productStatus,
      officialDolar,
      taxes,
      commissionCategory,
    };

    const datosBase = calculateDatosBase(fetchers);

    const tiposDeCambio = calculateValorDolar(fetchers.officialDolar);

    const emo = calculateEmo(fetchers);
    const costosOperativos = calculateCostosOperativos(
      fetchers,
      datosBase,
      tiposDeCambio,
      emo,
    );
    const costosCalculados = calculateCostosCalculados(
      datosBase,
      costosOperativos,
    );
    const resultados = calculateResultados(
      datosBase,
      costosOperativos,
      costosCalculados,
    );
    const precio = calculatePrecio(datosBase, costosOperativos);
    const salePrice = body.salePrice;
    const meliContributionPercentage = body.meliContributionPercentage ?? 0;
    const meliContributionAmount = Number(
      (datosBase.sellerNetPrice - salePrice).toFixed(2),
    );

    return {
      input: {
        mla: body.mla,
        categoryId: body.categoryId,
        publicationType: body.publicationType,
        sku: body.sku,
        salePrice,
        meliContributionPercentage,
      },
      prices: {
        salePrice,
        meliContributionPercentage,
        meliContributionAmount,
        sellerNetPrice: datosBase.sellerNetPrice,
      },
      datosBase,
      tiposDeCambio,
      costosOperativos,
      emo,
      costosCalculados,
      resultados: {
        totalCosts: resultados.totalCosts,
        operatingProfit: resultados.operatingProfit,
        operatingProfitPercent: `${(
          resultados.operatingProfitPercent * 100
        ).toFixed(1)}%`,
      },
      precio,
    };
  }
}
