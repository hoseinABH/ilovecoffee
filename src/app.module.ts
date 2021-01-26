import { Module } from '@nestjs/common';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    CoffeesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 1998,
      username: 'postgres',
      password: '5454911',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
