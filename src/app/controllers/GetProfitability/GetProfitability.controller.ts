import { Controller, Post } from '@nestjs/common';

@Controller('internal')
export class GetProfitabilitycontroller {
  @Post('getProfit')
  async getProfitOfMla() {
    return 'true';
  }
}
