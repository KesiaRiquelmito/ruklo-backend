import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { IEvent } from '../../interfaces/IEvent';
import * as path from 'node:path';
import { readFile } from 'fs/promises';

@Injectable()
export class ClientService implements OnModuleInit {
  private readonly logger = new Logger(ClientService.name);
  private events: IEvent[] = [];

  async onModuleInit() {
    this.logger.log('Starting client service');
    await this.loadDataFromJson();
  }

  /**
   * This function load the events data from the json and convert the timestamp
   * string to Date format to be used for future date operations
   * @private
   */
  private async loadDataFromJson() {
    try {
      this.logger.log('Loading events data from JSON');
      const filePath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'ruklo_events_1000.json',
      );

      const fileContent = await readFile(filePath, 'utf8');

      const rawEvents = JSON.parse(fileContent);

      this.events = rawEvents.map((event: IEvent) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }));
      this.logger.log(`Loaded ${this.events.length} events from JSON file`);
    } catch (error) {
      this.logger.error('Failed to load events JSON', error);
    }
  }
}
