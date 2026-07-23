import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsUUID()
  spvId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;
}
