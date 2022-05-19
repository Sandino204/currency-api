import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coin, CoinSchema } from 'src/coin/coin.entity';
import { CoinRepository } from 'src/coin/coin.repository';
import { ConversionService } from './conversion.service';
import { ConversionController } from './conversion.controller';
import { ConversionRepository } from './conversion.repository';
import { Conversion, ConversionSchema } from './conversion.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversion.name, schema: ConversionSchema },
      { name: Coin.name, schema: CoinSchema },
    ]),
  ],
  controllers: [ConversionController],
  providers: [ConversionService, ConversionRepository, CoinRepository],
})
export class ConversionModule {}
