import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ClientService } from './client.service';
import { Benefit } from './entities/benefit.entity';
import { ClientHistory } from '../interfaces/IClientHistory';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOkResponse({
    description: 'List of all clients with benefits',
    type: [Benefit],
  })
  @Get('benefits')
  async getAllClientsBenefits(): Promise<Benefit[]> {
    return this.clientService.getAllClientsBenefits();
  }

  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiOkResponse({
    description: 'Client transaction history with averages',
    type: ClientHistory,
  })
  @ApiNotFoundResponse({ description: 'Client not found' })
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

  @ApiOkResponse({
    description: 'All clients histories',
    type: [ClientHistory],
  })
  @Get('history/all')
  async getAllClientHistories(): Promise<ClientHistory[]> {
    return this.clientService.getAllClientHistories();
  }
}
