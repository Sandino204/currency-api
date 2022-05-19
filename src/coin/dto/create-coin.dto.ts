import {
  IsString, MinLength, MaxLength, IsNotEmpty,
} from 'class-validator';

export class CreateCoinDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsNotEmpty()
    name: string;

  @IsString()
  @IsNotEmpty()
    symbol: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @MinLength(3)
    code: string;
}
