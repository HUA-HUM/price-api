import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetProfitabilityInteractor } from 'src/core/interactor/getProfitability/getProfitability';
import { GetProfitabilityBySalesChannelRequestDto } from 'src/app/controllers/GetProfitability/dto/get-profitability-by-sales-channel-request.dto';
import { GetProfitabilityBySalesChannelResponseDto } from 'src/app/controllers/GetProfitability/dto/get-profitability-by-sales-channel-response.dto';
import { GetProfitabilityBySalesChannelDetailsResponseDto } from 'src/app/controllers/GetProfitability/dto/get-profitability-by-sales-channel-details-response.dto';
import {
  GetProfitabilityRequestWithContributionDto,
  GetProfitabilityRequestWithoutContributionDto,
} from 'src/app/controllers/GetProfitability/dto/get-profitability-request.dto';
import { GetProfitabilityResponseDto } from 'src/app/controllers/GetProfitability/dto/get-profitability-response.dto';
import { GetProfitabilityDetailsResponseDto } from 'src/app/controllers/GetProfitability/dto/get-profitability-details-response.dto';

type GetProfitabilityRequest =
  | GetProfitabilityRequestWithContributionDto
  | GetProfitabilityRequestWithoutContributionDto;

const VALID_SALES_CHANNELS = new Set(['megatone', 'fravega', 'oncity']);

@Injectable()
export class GetProfitabilityService {
  private static readonly MAX_BULK_ITEMS = 50;

  constructor(
    private readonly getProfitabilityInteractor: GetProfitabilityInteractor,
  ) {}

  async getProfitability(
    body: GetProfitabilityRequest,
  ): Promise<GetProfitabilityResponseDto> {
    this.validateRequest(body);
    return this.getProfitabilityInteractor.execute(body);
  }

  async getProfitabilityDetails(
    body: GetProfitabilityRequest,
  ): Promise<GetProfitabilityDetailsResponseDto> {
    this.validateRequest(body);
    return this.getProfitabilityInteractor.executeDetailed(body);
  }

  async getProfitabilityBySalesChannel(
    body: GetProfitabilityBySalesChannelRequestDto,
  ): Promise<GetProfitabilityBySalesChannelResponseDto> {
    this.validateSalesChannelRequest(body);
    return this.getProfitabilityInteractor.executeBySalesChannel(body);
  }

  async getProfitabilityDetailsBySalesChannel(
    body: GetProfitabilityBySalesChannelRequestDto,
  ): Promise<GetProfitabilityBySalesChannelDetailsResponseDto> {
    this.validateSalesChannelRequest(body);
    return this.getProfitabilityInteractor.executeDetailedBySalesChannel(body);
  }

  async getProfitabilityBulk(
    body: GetProfitabilityRequest[],
  ): Promise<GetProfitabilityResponseDto[]> {
    this.validateBulkRequest(body);
    return this.getProfitabilityInteractor.executeBulk(body);
  }

  async getProfitabilityDetailsBulk(
    body: GetProfitabilityRequest[],
  ): Promise<GetProfitabilityDetailsResponseDto[]> {
    this.validateBulkRequest(body);
    return this.getProfitabilityInteractor.executeDetailedBulk(body);
  }

  private validateRequest(body: GetProfitabilityRequest) {
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

  private validateBulkRequest(body: GetProfitabilityRequest[]) {
    if (!Array.isArray(body)) {
      throw new BadRequestException('body must be an array');
    }

    if (body.length === 0) {
      throw new BadRequestException('body must contain at least 1 item');
    }

    if (body.length > GetProfitabilityService.MAX_BULK_ITEMS) {
      throw new BadRequestException(
        `body can contain up to ${GetProfitabilityService.MAX_BULK_ITEMS} items`,
      );
    }
  }

  private validateSalesChannelRequest(
    body: GetProfitabilityBySalesChannelRequestDto,
  ) {
    if (!body.sku?.trim()) {
      throw new BadRequestException('sku is required');
    }

    if (typeof body.salePrice !== 'number' || body.salePrice <= 0) {
      throw new BadRequestException('salePrice must be a number greater than 0');
    }

    if (!body.salesChannel?.trim()) {
      throw new BadRequestException('salesChannel is required');
    }

    body.salesChannel = body.salesChannel.trim().toLowerCase() as typeof body.salesChannel;

    if (!VALID_SALES_CHANNELS.has(body.salesChannel)) {
      throw new BadRequestException(
        'salesChannel must be one of: megatone, fravega, oncity',
      );
    }
  }

}
