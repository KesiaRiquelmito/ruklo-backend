import { Controller } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly moduleService: ClientService) {}
}
