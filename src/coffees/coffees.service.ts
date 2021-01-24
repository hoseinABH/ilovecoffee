import { Coffee } from './entities/coffee.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'hot chocholate',
      brand: 'alicafe',
      flavour: ['well smell', 'dark'],
    },
  ];

  findAll(): Coffee[] {
    return this.coffees;
  }
  findOne(id: string): Coffee {
    const coffee = this.coffees.find((coffee) => coffee.id === +id);
    if (!coffee) {
      throw new NotFoundException(`Coffee with id #${id} not found!`);
    }
    return coffee;
  }
  create(createCoffeeDto: any): Coffee {
    this.coffees.push(createCoffeeDto);
    return createCoffeeDto;
  }
  async update(updateCoffeeDto: any, id: string): Promise<Coffee> {
    const { name, brand, flavour } = updateCoffeeDto;
    const exist = this.findOne(id);
    if (exist) {
      exist.name = await name;
      exist.brand = await brand;
      exist.flavour = await flavour;
      return exist;
    }
  }
  remove(id: string): void {
    const coffeeIndex = this.coffees.findIndex((coffee) => coffee.id === +id);
    if (coffeeIndex >= 0) {
      this.coffees.splice(coffeeIndex, 1);
    } else {
      throw new NotFoundException();
    }
  }
}
