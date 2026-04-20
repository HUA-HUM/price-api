import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetProfitabilityInteractor } from 'src/core/interactor/getProfitability/getProfitability';
import {
  GetProfitabilityRequestWithContributionDto,
  GetProfitabilityRequestWithoutContributionDto,
} from 'src/app/controllers/GetProfitability/dto/get-profitability-request.dto';
import { GetProfitabilityResponseDto } from 'src/app/controllers/GetProfitability/dto/get-profitability-response.dto';
import { GetProfitabilityDetailsResponseDto } from 'src/app/controllers/GetProfitability/dto/get-profitability-details-response.dto';

type GetProfitabilityRequest =
  | GetProfitabilityRequestWithContributionDto
  | GetProfitabilityRequestWithoutContributionDto;

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

  async getProfitabilityBulk(
    body: GetProfitabilityRequest[],
  ): Promise<GetProfitabilityResponseDto[]> {
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

    return Promise.all(
      body.map(async (item, index) => {
        try {
          return await this.getProfitability(item);
        } catch (error) {
          if (error instanceof BadRequestException) {
            throw new BadRequestException(`item ${index + 1}: ${error.message}`);
          }

          if (error instanceof NotFoundException) {
            throw new NotFoundException(`item ${index + 1}: ${error.message}`);
          }

          throw error;
        }
      }),
    );
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

}
