export interface IEvent {
  client_id: string;
  store_id: string;
  type: 'recharge' | 'visit';
  timestamp: Date;
  amount?: number;
}
