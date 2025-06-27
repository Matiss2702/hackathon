import { IsString, IsBoolean } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  name: string;

  @IsString()
  vat: string;

  @IsString()
  siren: string;

  @IsString()
  siret: string;

  @IsString()
  rib: string;

  @IsBoolean()
  isDeleted: boolean;
}
