import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from '../security/api-key.guard';
import { AppController } from '../controllers/app.controller';
import { GetProfitabilityModule } from './getProfitability/GetProfitability.Module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GetProfitabilityModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
