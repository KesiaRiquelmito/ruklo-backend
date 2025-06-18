import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientsController } from './clients.controller';
import { Benefit } from './entities/benefit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Store } from './entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Store, Benefit])],
  controllers: [ClientsController],
  providers: [ClientService],
})
export class ClientsModule {}
