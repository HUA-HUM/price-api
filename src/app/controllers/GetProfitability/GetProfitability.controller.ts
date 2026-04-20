import { Body, Controller, Logger, Post, Query } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiKeyProtected } from '../../security/api-key-protected.decorator';
import { GetProfitabilityService } from '../../services/getProfitability/get-profitability.service';
import {
  GetProfitabilityRequestWithContributionDto,
  GetProfitabilityRequestWithoutContributionDto,
} from './dto/get-profitability-request.dto';
import { GetProfitabilityResponseDto } from './dto/get-profitability-response.dto';
import { GetProfitabilityDetailsResponseDto } from './dto/get-profitability-details-response.dto';
import { GetProfitabilityDetailsBulkResponseDto } from './dto/get-profitability-details-bulk-response.dto';

@ApiTags('profitability')
@ApiExtraModels(
  GetProfitabilityRequestWithContributionDto,
  GetProfitabilityRequestWithoutContributionDto,
  GetProfitabilityResponseDto,
  GetProfitabilityDetailsResponseDto,
  GetProfitabilityDetailsBulkResponseDto,
)
@Controller('internal')
export class GetProfitabilitycontroller {
  private readonly logger = new Logger(GetProfitabilitycontroller.name);

  constructor(
    private readonly getProfitabilityService: GetProfitabilityService,
  ) {}

  @Post('getProfit')
  @ApiKeyProtected()
  @ApiOperation({
    summary: 'Calcula rentabilidad de una promocion para un MLA y SKU',
  })
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(GetProfitabilityRequestWithContributionDto),
        },
        {
          $ref: getSchemaPath(GetProfitabilityRequestWithoutContributionDto),
        },
      ],
    },
    examples: {
      withMeliContribution: {
        summary: 'Promocion con aporte de Mercado Libre',
        value: {
          mla: 'MLA2228742950',
          categoryId: 'MLA31040',
          publicationType: 'gold_special',
          sku: 'B0F47N62NN',
          salePrice: 731399,
          meliContributionPercentage: 2.4,
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
    return this.getProfitabilityService.getProfitability(body);
  }

  @Post('getProfit/details')
  @ApiKeyProtected()
  @ApiOperation({
    summary:
      'Devuelve el detalle completo de rentabilidad con todos los objetos intermedios',
  })
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(GetProfitabilityRequestWithContributionDto),
        },
        {
          $ref: getSchemaPath(GetProfitabilityRequestWithoutContributionDto),
        },
      ],
    },
    examples: {
      withMeliContribution: {
        summary: 'Promocion con aporte de Mercado Libre',
        value: {
          mla: 'MLA2228742950',
          categoryId: 'MLA31040',
          publicationType: 'gold_special',
          sku: 'B0F47N62NN',
          salePrice: 731399,
          meliContributionPercentage: 2.4,
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
    description: 'Detalle completo con todos los objetos compuestos',
    type: GetProfitabilityDetailsResponseDto,
  })
  async getProfitabilityDetails(
    @Body()
    body:
      | GetProfitabilityRequestWithContributionDto
      | GetProfitabilityRequestWithoutContributionDto,
  ): Promise<GetProfitabilityDetailsResponseDto> {
    this.logRequest('Price detail request received', body);
    return this.getProfitabilityService.getProfitabilityDetails(body);
  }

  @Post('getProfit/details/bulk')
  @ApiKeyProtected()
  @ApiOperation({
    summary:
      'Devuelve el detalle completo en lote para hasta 50 promociones con paginado de respuesta',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Pagina a devolver. Default: 1.',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    example: 10,
    description: 'Cantidad de items por pagina. Default: total del lote. Max: 50.',
  })
  @ApiBody({
    schema: {
      type: 'array',
      maxItems: 50,
      items: {
        oneOf: [
          {
            $ref: getSchemaPath(GetProfitabilityRequestWithContributionDto),
          },
          {
            $ref: getSchemaPath(GetProfitabilityRequestWithoutContributionDto),
          },
        ],
      },
    },
    examples: {
      bulkExample: {
        summary: 'Lote de detalle con items con y sin aporte de Mercado Libre',
        value: [
          {
            mla: 'MLA2228742950',
            categoryId: 'MLA31040',
            publicationType: 'gold_special',
            sku: 'B0F47N62NN',
            salePrice: 731399,
            meliContributionPercentage: 2.4,
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
    description: 'Detalle completo paginado para las promociones enviadas',
    type: GetProfitabilityDetailsBulkResponseDto,
  })
  async getProfitabilityDetailsBulk(
    @Body()
    body: Array<
      | GetProfitabilityRequestWithContributionDto
      | GetProfitabilityRequestWithoutContributionDto
    >,
    @Query('page') pageQuery?: string,
    @Query('perPage') perPageQuery?: string,
  ): Promise<GetProfitabilityDetailsBulkResponseDto> {
    const page = this.parsePositiveInteger(pageQuery, 1);
    const requestedPerPage = this.parsePositiveInteger(perPageQuery, body.length);
    const perPage = Math.min(requestedPerPage, 50);

    this.logger.log(
      `Bulk price detail request received: ${body.length} items (page ${page}, perPage ${perPage})`,
    );
    body.forEach((item, index) => {
      this.logRequest(`Bulk detail item ${index + 1} received`, item);
    });

    const results =
      await this.getProfitabilityService.getProfitabilityDetailsBulk(body);
    const total = results.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * perPage;
    const items = results.slice(start, start + perPage);

    return {
      items,
      total,
      page: safePage,
      perPage,
      totalPages,
    };
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
            $ref: getSchemaPath(GetProfitabilityRequestWithContributionDto),
          },
          {
            $ref: getSchemaPath(GetProfitabilityRequestWithoutContributionDto),
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
        $ref: getSchemaPath(GetProfitabilityResponseDto),
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
    this.logger.log(`Bulk price request received: ${body.length} items`);
    body.forEach((item, index) => {
      this.logRequest(`Bulk item ${index + 1} received`, item);
    });

    return this.getProfitabilityService.getProfitabilityBulk(body);
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

  private parsePositiveInteger(value: string | undefined, fallback: number): number {
    if (!value) {
      return fallback;
    }

    const parsedValue = Number.parseInt(value, 10);

    return Number.isNaN(parsedValue) || parsedValue <= 0
      ? fallback
      : parsedValue;
  }
}
