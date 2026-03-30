export interface UserAlert {
  alertId: string;
  routeId: string;
  routeShortName: string;
  stopId: string;
  stopName: string;
  scheduledTime: number;  // unix ms
  leaveByTime: number;    // unix ms — already includes buffer
  delaySeconds: number;
  bufferMinutes: number;  // buffer baked into leaveByTime
  active: boolean;
  tripId: string;
  subscription?: PushSubscriptionJSON | null;
}
