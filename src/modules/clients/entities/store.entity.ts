import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Benefit } from './benefit.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Store {
  @ApiProperty({
    example: 'store1',
    description: 'Unique identifier of the store',
  })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ type: () => [Benefit], required: false })
  @OneToMany(() => Benefit, (benefit) => benefit.store)
  benefits: Benefit[];
}
