import { ConversionModule } from './conversion/conversion.module';
import { CoinModule } from './coin/coin.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';

@Module({
  imports: [
    ConversionModule,
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@mongodb:27017/`,
    ),
    CoinModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
