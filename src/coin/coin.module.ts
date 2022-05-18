import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Coin, CoinSchema } from './coin.entity';
import { Module } from '@nestjs/common';
import { CoinRepository } from './coin.repository';
import { Conversion, ConversionSchema } from '../conversion/conversion.entity';
import { ConversionRepository } from 'src/conversion/conversion.repository';

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
