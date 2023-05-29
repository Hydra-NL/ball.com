import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Ticket } from './tickets/ticket.entity';
import { TicketModule } from './tickets/ticket.module';
import { AmqpModule } from 'nestjs-amqp';

@Module({
  imports: [TicketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
