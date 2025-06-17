import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientsController } from './clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [ClientService],
})
export class ClientsModule {}
