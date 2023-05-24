import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { Ticket } from './ticket.entity';
import { TicketService } from './ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Post()
  async create(@Body() ticket: Ticket): Promise<Ticket> {
    return this.ticketService.create(ticket);
  }

  @Get()
  async findAll(): Promise<Ticket[]> {
    return this.ticketService.findAll();
  }

  @Get(':id')
  async findOne(id: number): Promise<Ticket> {
    return this.ticketService.findOne(id);
  }

  @Put(':id')
  async update(@Body() ticket: Ticket): Promise<Ticket> {
    return this.ticketService.update(ticket.id, ticket);
  }

  @Delete(':id')
  async remove(id: number): Promise<void> {
    return this.ticketService.remove(id);
  }
}
