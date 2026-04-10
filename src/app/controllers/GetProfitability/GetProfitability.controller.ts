import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeyProtected } from '../../security/api-key-protected.decorator';
import {
  GetProfitabilityRequestWithContributionDto,
  GetProfitabilityRequestWithoutContributionDto,
} from './dto/get-profitability-request.dto';
import { GetProfitabilityResponseDto } from './dto/get-profitability-response.dto';

@ApiTags('profitability')
@Controller('internal')
export class GetProfitabilitycontroller {
  private static readonly DEFAULT_COST = 70000;
  private static readonly MAX_BULK_ITEMS = 50;
  private readonly logger = new Logger(GetProfitabilitycontroller.name);

  @Post('getProfit')
  @ApiKeyProtected()
  @ApiOperation({
    summary: 'Calcula rentabilidad de una promocion para un MLA y SKU',
  })
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: '#/components/schemas/GetProfitabilityRequestWithContributionDto',
        },
        {
          $ref: '#/components/schemas/GetProfitabilityRequestWithoutContributionDto',
        },
      ],
    },
    examples: {
      withMeliContribution: {
        summary: 'Promocion con aporte de Mercado Libre',
        value: {
          mla: 'MLA123456789',
          categoryId: 'MLA002',
          publicationType: 'gold_special',
          sku: 'SKU123',
          salePrice: 100000,
          meliContributionPercentage: 10,
        },
      },
      withoutMeliContribution: {
        summary: 'Promocion sin aporte de Mercado Libre',
        value: {
          mla: 'MLA123456789',
          categoryId: 'MLA002',
          publicationType: 'gold_special',
          sku: 'SKU123',
          salePrice: 100000,
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Resultado economico de la promocion',
    type: GetProfitabilityResponseDto,
  })
  async getProfitOfMla(
    @Body()
    body:
      | GetProfitabilityRequestWithContributionDto
      | GetProfitabilityRequestWithoutContributionDto,
  ): Promise<GetProfitabilityResponseDto> {
    this.logRequest('Price request received', body);
    return this.calculateProfitability(body);
  }

  @Post('getProfit/bulk')
  @ApiKeyProtected()
  @ApiOperation({
    summary:
      'Calcula rentabilidad en lote para hasta 50 promociones en una sola request',
  })
  @ApiBody({
    schema: {
      type: 'array',
      maxItems: 50,
      items: {
        oneOf: [
          {
            $ref: '#/components/schemas/GetProfitabilityRequestWithContributionDto',
          },
          {
            $ref: '#/components/schemas/GetProfitabilityRequestWithoutContributionDto',
          },
        ],
      },
    },
    examples: {
      bulkExample: {
        summary: 'Lote con items con y sin aporte de Mercado Libre',
        value: [
          {
            mla: 'MLA123456789',
            categoryId: 'MLA002',
            publicationType: 'gold_special',
            sku: 'SKU123',
            salePrice: 100000,
            meliContributionPercentage: 10,
          },
          {
            mla: 'MLA987654321',
            categoryId: 'MLA410558',
            publicationType: 'gold_pro',
            sku: 'SKU456',
            salePrice: 85000,
          },
        ],
      },
    },
  })
  @ApiOkResponse({
    description: 'Resultados economicos para cada promocion enviada',
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/GetProfitabilityResponseDto',
      },
    },
  })
  async getProfitabilityBulk(
    @Body()
    body: Array<
      | GetProfitabilityRequestWithContributionDto
      | GetProfitabilityRequestWithoutContributionDto
    >,
  ): Promise<GetProfitabilityResponseDto[]> {
    if (!Array.isArray(body)) {
      throw new BadRequestException('body must be an array');
    }

    if (body.length === 0) {
      throw new BadRequestException('body must contain at least 1 item');
    }

    if (body.length > GetProfitabilitycontroller.MAX_BULK_ITEMS) {
      throw new BadRequestException(
        `body can contain up to ${GetProfitabilitycontroller.MAX_BULK_ITEMS} items`,
      );
    }

    this.logger.log(`Bulk price request received: ${body.length} items`);

    return body.map((item, index) => {
      try {
        this.logRequest(`Bulk item ${index + 1} received`, item);
        return this.calculateProfitability(item);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw new BadRequestException(`item ${index + 1}: ${error.message}`);
        }

        throw error;
      }
    });
  }

  private validateRequest(
    body:
      | GetProfitabilityRequestWithContributionDto
      | GetProfitabilityRequestWithoutContributionDto,
  ) {
    if (!body.mla?.trim()) {
      throw new BadRequestException('mla is required');
    }

    if (!body.sku?.trim()) {
      throw new BadRequestException('sku is required');
    }

    if (!body.categoryId?.trim()) {
      throw new BadRequestException('categoryId is required');
    }

    if (!body.publicationType?.trim()) {
      throw new BadRequestException('publicationType is required');
    }

    if (typeof body.salePrice !== 'number' || body.salePrice <= 0) {
      throw new BadRequestException('salePrice must be a number greater than 0');
    }

    if (
      body.meliContributionPercentage !== undefined &&
      (typeof body.meliContributionPercentage !== 'number' ||
        body.meliContributionPercentage < 0 ||
        body.meliContributionPercentage > 100)
    ) {
      throw new BadRequestException(
        'meliContributionPercentage must be a number between 0 and 100',
      );
    }
  }

  private calculateProfitability(
    body:
      | GetProfitabilityRequestWithContributionDto
      | GetProfitabilityRequestWithoutContributionDto,
  ): GetProfitabilityResponseDto {
    this.validateRequest(body);

    const salePrice = body.salePrice;
    const meliContributionPercentage = body.meliContributionPercentage ?? 0;
    const meliContributionAmount = this.roundCurrency(
      (salePrice * meliContributionPercentage) / 100,
    );
    const sellerNetPrice = this.roundCurrency(
      salePrice + meliContributionAmount,
    );
    const cost = GetProfitabilitycontroller.DEFAULT_COST;
    const profitAmount = this.roundCurrency(sellerNetPrice - cost);
    const profitabilityPercent = this.roundPercentage(
      (profitAmount / cost) * 100,
    );
    const marginPercent = this.roundPercentage(
      (profitAmount / sellerNetPrice) * 100,
    );
    const profitable = profitAmount > 0;

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
        sellerNetPrice,
      },
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

  private logRequest(
    prefix: string,
    body:
      | GetProfitabilityRequestWithContributionDto
      | GetProfitabilityRequestWithoutContributionDto,
  ) {
    this.logger.log(
      `${prefix}: ${JSON.stringify({
        mla: body.mla,
        categoryId: body.categoryId,
        publicationType: body.publicationType,
        sku: body.sku,
        salePrice: body.salePrice,
        meliContributionPercentage: body.meliContributionPercentage ?? 0,
      })}`,
    );
  }

  private roundCurrency(value: number): number {
    return Number(value.toFixed(2));
  }

  private roundPercentage(value: number): number {
    return Number(value.toFixed(2));
  }
}
