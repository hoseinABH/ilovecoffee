import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavour } from './entities/flavour.entity';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { PaginationQueryDto } from './../common/dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffee.constants';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee) private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavour) private readonly flavourRepository: Repository<Flavour>,
    private readonly connection: Connection,
    @Inject(COFFEE_BRANDS) coffeeBrands: string[]
  ) {
    console.log(coffeeBrands);
  }

  // find all coffees
  async findAll(paginationQueryDto: PaginationQueryDto): Promise<Coffee[]> {
    const { offset, limit } = paginationQueryDto;
    return this.coffeeRepository.find({ relations: ['flavours'], skip: offset, take: limit });
  }

  // findOne Coffee
  async findOne(id: string): Promise<Coffee> {
    const coffee = await this.coffeeRepository.findOne(id, { relations: ['flavours'] });
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

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coffee.recommendations++;
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async preloadFlavourByname(name: string): Promise<Flavour> {
    const existingFlavour = await this.coffeeRepository.findOne({ name });

    if (existingFlavour) {
      return existingFlavour;
    }
    return this.flavourRepository.create({ name });
  }
}
