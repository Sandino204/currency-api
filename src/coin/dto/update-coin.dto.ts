import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

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
  @MinLength(3)
  code?: string;
}
