import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { IEvent } from '../interfaces/IEvent';
import * as path from 'node:path';
import { readFile } from 'fs/promises';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { Benefit } from './entities/benefit.entity';
import { startOfISOWeek, formatISO, addWeeks } from 'date-fns';
import {
  ClientHistory,
  WeeklyRechargeStat,
} from '../interfaces/IClientHistory';

@Injectable()
/**
 * Service responsible for processing client events, awarding benefits,
 * and exposing transaction history logic.
 *
 * On initialization, loads events from JSON and processes client benefits.
 */
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

  /**
   * Retrieves all client benefits stored in the database, ordered by the date
   * they were awarded (ascending).
   *
   * Each benefit includes the associated client and store thanks to eager loading.
   *
   * @returns An array of `Benefit` entities, ordered by `awardedAt` ascending
   */
  async getAllClientsBenefits(): Promise<Benefit[]> {
    return this.benefitRepository.find({ order: { awardedAt: 'ASC' } });
  }

  /**
   * Returns the full transaction history for a client, including:
   * - Visit and recharge events
   * - Weekly recharge averages (0 if no recharges that week)
   *
   * @param clientId - ID of the client
   * @returns ClientHistory object with events and weekly stats
   */
  async getClientTransactionHistory(clientId: string): Promise<ClientHistory> {
    // filter events by client
    const clientEvents = this.events.filter((e) => e.client_id === clientId);
    if (clientEvents.length === 0) {
      throw new Error(`Client ${clientId} not found in events file`);
    }

    const visits = clientEvents.filter((e) => e.type === 'visit');
    const recharges = clientEvents.filter((e) => e.type === 'recharge');

    //Group recharges by ISO week
    const stats: Record<string, { sum: number; count: number }> = {};
    for (const r of recharges) {
      const weekKey = formatISO(startOfISOWeek(r.timestamp), {
        representation: 'date',
      });
      if (!stats[weekKey]) stats[weekKey] = { sum: 0, count: 0 };
      stats[weekKey].sum += r.amount ?? 0;
      stats[weekKey].count += 1;
    }

    // build range of continuous weeks
    const sortedEvents = clientEvents.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    let cursor = startOfISOWeek(sortedEvents[0].timestamp);
    const last = startOfISOWeek(
      sortedEvents[sortedEvents.length - 1].timestamp,
    );

    const rechargeWeeklyAverage: WeeklyRechargeStat[] = [];
    while (cursor <= last) {
      const key = formatISO(cursor, { representation: 'date' });
      const info = stats[key];
      rechargeWeeklyAverage.push({
        weekStart: key,
        averageAmount: info ? info.sum / info.count : 0,
      });
      cursor = addWeeks(cursor, 1);
    }
    return {
      clientId,
      transactions: {
        visit: visits.map((v) => ({
          storeId: v.store_id,
          timestamp: v.timestamp.toISOString(),
        })),
        recharge: recharges.map((r) => ({
          storeId: r.store_id,
          amount: r.amount!,
          timestamp: r.timestamp.toISOString(),
        })),
      },
      rechargeWeeklyAverage,
    };
  }

  /**
   * Returns the transaction history for all clients present in the events dataset.
   * This is equivalent to calling `getClientTransactionHistory()` for each distinct client.
   *
   * @returns An array of `ClientHistory` objects, one per client
   */
  async getAllClientHistories(): Promise<ClientHistory[]> {
    const clientIds = Array.from(new Set(this.events.map((e) => e.client_id)));
    return Promise.all(
      clientIds.map((id) => this.getClientTransactionHistory(id)),
    );
  }
}
