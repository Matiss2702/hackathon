import { IsString } from 'class-validator';

export class CreateOrganizationDto {
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
}
