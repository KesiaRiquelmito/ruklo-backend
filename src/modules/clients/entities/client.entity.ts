import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Benefit } from './benefit.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Client {
  @ApiProperty({
    example: 'client_1',
    description: 'Unique identifier of the client',
  })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ type: () => [Benefit], required: false })
  @OneToMany(() => Benefit, (benefit) => benefit.client)
  benefits: Benefit[];
}
