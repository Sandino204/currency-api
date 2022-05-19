import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CoinService } from './coin.service';
import { CreateCoinDto } from './dto/create-coin.dto';
import { UpdateBody } from './interfaces/update.interface';

@Controller('coin')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get()
  async getAll() {
    return this.coinService.getAllCoins();
  }

  @Get('/:code')
  async getByCode(@Param('code') code: string) {
    return this.coinService.getCoinByCode(code);
  }

  @Post()
  async createCoin(@Body() payload: CreateCoinDto) {
    return this.coinService.createCoin(payload);
  }

  @Patch('/:code')
  async updateCoin(@Body() payload: UpdateBody, @Param('code') code: string) {
    return this.coinService.updateCoin({
      ...payload,
      code,
    });
  }

  @Delete('/:id')
  async deleteCoin(@Param('id') id: string) {
    return this.coinService.deleteCoin(id);
  }
}
