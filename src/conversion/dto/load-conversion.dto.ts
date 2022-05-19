import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class LoadConversionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @MinLength(3)
    from: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @MinLength(3)
    to: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
    conversion: number;
}
