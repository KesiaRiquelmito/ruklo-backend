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
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Benefit {
  @ApiProperty({ example: 1, description: 'Benefit ID (auto-incremented)' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Client })
  @ManyToOne(() => Client, (client) => client.benefits, { eager: true })
  client: Client;

  @ApiProperty({ type: () => Store })
  @ManyToOne(() => Store, (store) => store.benefits, { eager: true })
  store: Store;

  @ApiProperty({
    example: '2025-06-19T12:30:00.000Z',
    description: 'When the benefit was awarded',
  })
  @Column()
  awardedAt: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
