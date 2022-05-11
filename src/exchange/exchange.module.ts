import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [ExchangeController],
  providers: [ExchangeService],
})
export class ExchangeModule {}
