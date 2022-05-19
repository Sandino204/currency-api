import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConversionRepository } from 'src/conversion/conversion.repository';
import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { Coin, CoinSchema } from './coin.entity';
import { CoinRepository } from './coin.repository';
import { Conversion, ConversionSchema } from '../conversion/conversion.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversion.name, schema: ConversionSchema },
      { name: Coin.name, schema: CoinSchema },
    ]),
  ],
  controllers: [CoinController],
  providers: [CoinService, CoinRepository, ConversionRepository],
})
export class CoinModule {}
