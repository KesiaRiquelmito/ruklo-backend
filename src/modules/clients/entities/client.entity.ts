import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Benefit } from './benefit.entity';

@Entity()
export class Client {
  @PrimaryColumn()
  id: string;

  @OneToMany(() => Benefit, (benefit) => benefit.client)
  benefits: Benefit[];
}
