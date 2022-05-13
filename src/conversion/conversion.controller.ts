/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Post, Put } from '@nestjs/common';
import { ConversionService } from './conversion.service';
import { ConversionDto } from './dto/conversion.dto';
import { LoadConversionDto } from './dto/load-conversion.dto';

@Controller('/conversion')
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @Post('/')
  convert(@Body() payload: ConversionDto) {
    return this.conversionService.convert(payload);
  }

  @Put('/load')
  loadConversion(@Body() payload: LoadConversionDto) {
    return this.conversionService.loadData(payload);
  }
}
