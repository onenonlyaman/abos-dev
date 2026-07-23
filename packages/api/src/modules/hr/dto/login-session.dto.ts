import { IsNotEmpty, IsString } from 'class-validator';

export class LoginSessionDto {
  @IsString()
  @IsNotEmpty()
  ipAddress!: string;

  @IsString()
  @IsNotEmpty()
  device!: string;
}
