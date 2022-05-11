import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Coin, CoinSchema } from './coin.entity';
import { Module } from '@nestjs/common';
import { CoinRepository } from './coin.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coin.name, schema: CoinSchema }]),
  ],
  controllers: [CoinController],
  providers: [CoinService, CoinRepository],
})
export class CoinModule {}
