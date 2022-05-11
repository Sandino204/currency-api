import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class UpdateCoinDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  symbol?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  @MaxLength(3)
  code?: string;
}
