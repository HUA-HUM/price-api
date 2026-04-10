import { Module } from '@nestjs/common';
import { GetProfitabilitycontroller } from '../../controllers/GetProfitability/GetProfitability.controller';

@Module({
  controllers: [GetProfitabilitycontroller],
})
export class GetProfitabilityModule {}
