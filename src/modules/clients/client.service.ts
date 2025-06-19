import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { IEvent } from '../interfaces/IEvent';
import * as path from 'node:path';
import { readFile } from 'fs/promises';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { Benefit } from './entities/benefit.entity';

@Injectable()
export class ClientService implements OnModuleInit {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Benefit)
    private benefitRepository: Repository<Benefit>,
  ) {}

  private readonly logger = new Logger(ClientService.name);
  private events: IEvent[] = [];

  async onModuleInit() {
    this.logger.log('Starting client service');
    await this.loadDataFromJson();
    await this.getClientBenefits();
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
      this.logger.error('Failed to load events from JSON file:', error.message);
    }
  }

  /**
   * Iterate over all client events to detect those who visited the same store
   * 5 times in a row without recharging in between, and store the benefit in DB.
   */
  private async getClientBenefits() {
    // Initialize a map to group events by client_id
    const eventsByClient: Record<string, IEvent[]> = {};

    for (const event of this.events) {
      if (!eventsByClient[event.client_id]) {
        eventsByClient[event.client_id] = [];
      }
      eventsByClient[event.client_id].push(event);
    }

    // Iterate over each client and process their events
    for (const clientId in eventsByClient) {
      const sortedByDate = eventsByClient[clientId].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      );

      // initialize per-store visit counters
      const visitCounters: Record<string, number> = {};

      for (const event of sortedByDate) {
        if (event.type === 'visit') {
          // search the actual counter for the selected store_id, if not exist start in 0 and add 1
          visitCounters[event.store_id] =
            (visitCounters[event.store_id] || 0) + 1;

          if (visitCounters[event.store_id] === 5) {
            let client = await this.clientRepository.findOne({
              where: { id: clientId },
            });
            if (!client) {
              client = await this.clientRepository.save({ id: clientId });
            }

            let store = await this.storeRepository.findOne({
              where: { id: event.store_id },
            });
            if (!store) {
              store = await this.storeRepository.save({ id: event.store_id });
            }

            const exists = await this.benefitRepository.findOne({
              where: {
                client: { id: clientId },
                store: { id: event.store_id },
              },
            });

            if (!exists) {
              await this.benefitRepository.save({
                client: { id: client.id },
                store: { id: store.id },
                // date from 5th visit, when the benefit is acquired
                awardedAt: event.timestamp,
              });
              this.logger.log(
                `Benefit saved for client ${clientId} at store ${event.store_id}`,
              );
            } else {
              this.logger.debug(
                `Benefit already exist for client ${clientId} at store ${event.store_id}`,
              );
            }
          }
        } else if (event.type === 'recharge') {
          visitCounters[event.store_id] = 0;
        }
      }
    }
  }
  async getAllClientsBenefits(): Promise<Benefit[]> {
    return this.benefitRepository.find({ order: { awardedAt: 'ASC' } });
  }
}
