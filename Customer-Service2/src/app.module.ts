import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Ticket } from './tickets/ticket.entity';
import { TicketModule } from './tickets/ticket.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost:3306',
      port: 3306,
      username: 'administrator',
      password: 'password123',
      database: 'ballcom',
      entities: [Ticket],
    }),
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
