import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { TarificationService } from './tarification.service';
import { CreateTarificationDto } from './dto/create-tarification.dto';
import { UpdateTarificationDto } from './dto/update-tarification.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('tarification')
export class TarificationController {
  constructor(private readonly tarificationService: TarificationService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTarificationDto) {
    return this.tarificationService.create(user, dto);
  }

  @Get('/public')
  findAllPublic() {
    return this.tarificationService.findAllPublic();
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.tarificationService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tarificationService.findOne(user, id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTarificationDto,
  ) {
    return this.tarificationService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tarificationService.remove(user, id);
  }
}
