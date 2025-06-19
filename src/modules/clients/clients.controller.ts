import { Controller, Get } from '@nestjs/common';
import { ClientService } from './client.service';
import { Benefit } from './entities/benefit.entity';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientService: ClientService) {}

  @Get('benefits')
  async getAllClientsBenefits(): Promise<Benefit[]> {
    return this.clientService.getAllClientsBenefits();
  }
}
