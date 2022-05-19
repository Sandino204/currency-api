import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class ConversionAllDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @MinLength(3)
    from: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
    value: number;
}
