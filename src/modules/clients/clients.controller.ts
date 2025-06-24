import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ClientService } from './client.service';
import { Benefit } from './entities/benefit.entity';
import { ClientHistory } from '../interfaces/IClientHistory';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientService: ClientService) {}

  @Get('benefits')
  async getAllClientsBenefits(): Promise<Benefit[]> {
    return this.clientService.getAllClientsBenefits();
  }

  @Get(':id/history')
  async getClientHistory(
    @Param('id') clientId: string,
  ): Promise<ClientHistory> {
    try {
      return await this.clientService.getClientTransactionHistory(clientId);
    } catch (error: any) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }
  }

  @Get('history/all')
  async getAllClientHistories(): Promise<ClientHistory[]> {
    return this.clientService.getAllClientHistories();
  }
}
