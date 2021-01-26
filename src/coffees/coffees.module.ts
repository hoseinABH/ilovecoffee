import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { Flavour } from './entities/flavour.entity';
import { Event } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffee.constants';

class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {}
@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavour, Event])],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,

    { provide: COFFEE_BRANDS, useFactory: () => ['alicafe', 'action'] },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
