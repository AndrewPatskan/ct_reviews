import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync, IsOptional } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  REDIS_URL: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
