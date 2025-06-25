import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentiaDto } from './create-agentia.dto';

export class UpdateAgentiaDto extends PartialType(CreateAgentiaDto) {} 