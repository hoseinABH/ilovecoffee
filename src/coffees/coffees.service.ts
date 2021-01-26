import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Flavour } from './entities/flavour.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee) private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavour) private readonly flavourRepository: Repository<Flavour>
  ) {}

  // find all coffees
  async findAll(): Promise<Coffee[]> {
    return this.coffeeRepository.find();
  }

  // findOne Coffee
  async findOne(id: string): Promise<Coffee> {
    const coffee = await this.coffeeRepository.findOne(id);
    if (!coffee) {
      throw new NotFoundException(`Coffee with id #${id} not found!`);
    }
    return coffee;
  }

  // create a Coffee
  async create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    const flavours = await Promise.all(
      createCoffeeDto.flavours.map((name) => this.preloadFlavourByname(name))
    );
    const coffee = this.coffeeRepository.create({ ...createCoffeeDto, flavours });
    return this.coffeeRepository.save(coffee);
  }

  // update a Coffee
  async update(updateCoffeeDto: UpdateCoffeeDto, id: string): Promise<Coffee> {
    const flavours =
      updateCoffeeDto.flavours &&
      (await Promise.all(
        updateCoffeeDto.flavours.map((name) => this.preloadFlavourByname(name))
      ));

    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavours,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee with id #${id} not found!`);
    }
    return this.coffeeRepository.save(coffee);
  }

  // remove a Coffee
  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  private async preloadFlavourByname(name: string): Promise<Flavour> {
    const existingFlavour = await this.coffeeRepository.findOne({ name });

    if (existingFlavour) {
      return existingFlavour;
    }
    return this.flavourRepository.create({ name });
  }
}
