import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './modules/clients/module/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
