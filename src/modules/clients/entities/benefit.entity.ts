import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { Store } from './store.entity';

@Entity()
export class Benefit {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Client, (client) => client.benefits)
  client: Client;

  @ManyToOne(() => Store, (store) => store.benefits)
  store: Store;

  @Column()
  awardedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
