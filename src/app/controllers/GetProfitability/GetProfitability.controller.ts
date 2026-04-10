import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
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

  private roundCurrency(value: number): number {
    return Number(value.toFixed(2));
  }

  private roundPercentage(value: number): number {
    return Number(value.toFixed(2));
  }
}
