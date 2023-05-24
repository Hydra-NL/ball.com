import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async create(ticket: Ticket): Promise<Ticket> {
    return await this.ticketRepository.save(ticket);
  }

  async findAll(): Promise<Ticket[]> {
    return await this.ticketRepository.find();
  }

  async findOne(id: number): Promise<Ticket> {
    return await this.ticketRepository.findOne({
      where: { id: id },
      lock: { mode: 'optimistic', version: 1 },
    });
  }

  async update(id: number, ticket: Ticket): Promise<Ticket> {
    const toUpdate = await this.ticketRepository.findOne({
      where: { id: id },
      lock: { mode: 'optimistic', version: 1 },
    });
    const updated = Object.assign(toUpdate, ticket);
    return await this.ticketRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    await this.ticketRepository.delete(id);
  }
}
