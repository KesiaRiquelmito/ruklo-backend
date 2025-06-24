import { ApiProperty } from '@nestjs/swagger';

export class WeeklyRechargeStat {
  @ApiProperty({ example: '2025-06-03', description: 'Start of ISO week' })
  weekStart: string;

  @ApiProperty({ example: 1500, description: 'Average recharge amount' })
  averageAmount: number;
}

export class VisitTransaction {
  @ApiProperty()
  storeId: string;

  @ApiProperty()
  timestamp: string;
}

export class RechargeTransaction {
  @ApiProperty()
  storeId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  timestamp: string;
}

export class ClientHistory {
  @ApiProperty()
  clientId: string;

  @ApiProperty({ type: [VisitTransaction] })
  transactions: {
    visit: VisitTransaction[];
    recharge: RechargeTransaction[];
  };

  @ApiProperty({ type: [WeeklyRechargeStat] })
  rechargeWeeklyAverage: WeeklyRechargeStat[];
}
