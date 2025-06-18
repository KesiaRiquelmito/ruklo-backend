import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Benefit } from './benefit.entity';

@Entity()
export class Store {
  @PrimaryColumn()
  id: string;

  @OneToMany(() => Benefit, (benefit) => benefit.store)
  benefits: Benefit[]
}