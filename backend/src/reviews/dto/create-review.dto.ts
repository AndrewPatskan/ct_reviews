import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: '65e7... ' })
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ example: 'Great product!' })
  @IsString()
  @IsNotEmpty()
  text: string;
}
