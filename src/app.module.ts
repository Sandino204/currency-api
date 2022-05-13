import { ConversionModule } from './conversion/conversion.module';
import { CoinModule } from './coin/coin.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConversionModule,
    MongooseModule.forRoot(`mongodb://test:123456@localhost:27017/`),
    CoinModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
