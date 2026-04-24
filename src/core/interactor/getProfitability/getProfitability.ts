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
import { MadreHttpError } from 'src/core/drivers/repositories/madre-api/http/errors/MadreHttpError';

@Injectable()
export class GetProfitabilityInteractor {
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
  }: {
    detail: GetProfitabilityDetailedResult;
  }): boolean {
    const missingRequiredValue = this.findMissingRequiredValue(detail);
    if (missingRequiredValue) {
      this.logger.warn(
        `Product marked as not profitable because a required pricing value is missing: ${JSON.stringify({
          sku: detail.input.sku,
          field: missingRequiredValue,
        })}`,
      );
      return false;
    }

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

    return true;
  }

  private findMissingRequiredValue(
    detail: GetProfitabilityDetailedResult,
  ): string | null {
    const requiredNumericFields: Array<[string, number]> = [
      ['prices.salePrice', detail.prices.salePrice],
      ['prices.sellerNetPrice', detail.prices.sellerNetPrice],
      ['datosBase.weightKg', detail.datosBase.weightKg],
      ['datosBase.volumetricWeightKg', detail.datosBase.volumetricWeightKg],
      [
        'costosOperativos.commissionMpPercentage',
        detail.costosOperativos.commissionMpPercentage,
      ],
      ['costosOperativos.precioAmzAmount', detail.costosOperativos.precioAmzAmount],
      ['costosOperativos.depositoUsaAmount', detail.costosOperativos.depositoUsaAmount],
      ['costosOperativos.costosAmcoAmount', detail.costosOperativos.costosAmcoAmount],
      ['costosOperativos.imptosAmcoAmount', detail.costosOperativos.imptosAmcoAmount],
      ['emo.ivaCatAranc', detail.emo.ivaCatAranc],
      ['emo.sumaTasasYDer', detail.emo.sumaTasasYDer],
      ['precio.suggestedPrice', detail.precio.suggestedPrice],
    ];

    for (const [field, value] of requiredNumericFields) {
      if (!Number.isFinite(value)) {
        return field;
      }
    }

    return null;
  }

  async executeDetailed(
    body: GetProfitabilityRequest,
  ): Promise<GetProfitabilityDetailedResult> {
    let productStatus;
    let taxes;

    try {
      productStatus = await this.getPriceSkuInteractor.execute(body.sku);

      if (!productStatus) {
        throw new NotFoundException(
          `No product status found for sku ${body.sku}`,
        );
      }

      taxes = await this.getTaxesInteractor.execute(body.categoryId);
    } catch (error) {
      if (this.shouldReturnZeroedResult(error)) {
        this.logger.warn(
          `Returning zeroed profitability detail because Madre data is missing: ${JSON.stringify({
            sku: body.sku,
            categoryId: body.categoryId,
            reason:
              error instanceof Error ? error.message : 'Unknown Madre error',
          })}`,
        );
        return this.buildZeroedDetailedResult(body);
      }

      throw error;
    }

    const officialDolar = await this.getDolarValueInteractor.execute();

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

  private shouldReturnZeroedResult(error: unknown): boolean {
    if (error instanceof NotFoundException) {
      return true;
    }

    return error instanceof MadreHttpError && error.statusCode === 404;
  }

  private buildZeroedDetailedResult(
    body: GetProfitabilityRequest,
  ): GetProfitabilityDetailedResult {
    const salePrice = body.salePrice;
    const meliContributionPercentage = body.meliContributionPercentage ?? 0;

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
        salePrice: 0,
        meliContributionPercentage: 0,
        meliContributionAmount: 0,
        sellerNetPrice: 0,
      },
      datosBase: {
        sku: body.sku,
        weightKg: 0,
        volumetricWeightKg: 0,
        sellerNetPrice: 0,
        categoryId: body.categoryId,
      },
      tiposDeCambio: {
        tcAmco: 0,
        tcTlq: 0,
      },
      costosOperativos: {
        commissionMpPercentage: 0,
        envioMlAmount: 0,
        precioAmzAmount: 0,
        depositoUsaAmount: 0,
        costosAmcoAmount: 0,
        imptosAmcoAmount: 0,
      },
      emo: {
        ivaCatAranc: 0,
        sumaTasasYDer: 0,
      },
      costosCalculados: {
        utilidadAmount: 0,
        impuestosMeliAmount: 0,
        comisionMpAmount: 0,
      },
      resultados: {
        totalCosts: 0,
        operatingProfit: 0,
        operatingProfitPercent: '0.0%',
      },
      precio: {
        suggestedPrice: 0,
        discount: '0.00%',
      },
    };
  }
}
