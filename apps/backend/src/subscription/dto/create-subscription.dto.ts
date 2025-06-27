import { IsObject } from 'class-validator';

export class CreateSubscriptionDto {
  @IsObject()
  tarification: object;
}
