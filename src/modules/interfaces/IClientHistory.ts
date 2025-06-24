export interface WeeklyRechargeStat {
  weekStart: string;
  averageAmount: number;
}

export interface ClientHistory {
  clientId: string;
  transactions: {
    visit: Array<{
      storeId: string;
      timestamp: string;
    }>;
    recharge: Array<{
      storeId: string;
      amount: number;
      timestamp: string;
    }>;
  };
  rechargeWeeklyAverage: WeeklyRechargeStat[];
}
