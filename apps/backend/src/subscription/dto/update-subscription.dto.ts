import { IsObject } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsObject()
  tarification: object;
}
