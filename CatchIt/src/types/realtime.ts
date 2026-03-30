// GTFS-Realtime types matching the TFI JSON feed (snake_case keys)
export interface StopTimeEvent {
  delay?: number;       // seconds
  time?: number;        // unix timestamp
}

export interface StopTimeUpdate {
  stop_sequence?: number;
  stop_id?: string;
  arrival?: StopTimeEvent;
  departure?: StopTimeEvent;
  schedule_relationship?: string;
}

export interface TripDescriptor {
  trip_id?: string;
  route_id?: string;
  direction_id?: number;
  start_time?: string;
  start_date?: string;
  schedule_relationship?: string;
}

export interface TripUpdate {
  trip: TripDescriptor;
  stop_time_update?: StopTimeUpdate[];
  timestamp?: number;
  delay?: number;
}

export interface FeedEntity {
  id: string;
  is_deleted?: boolean;
  trip_update?: TripUpdate;
}

export interface FeedMessage {
  header: {
    gtfs_realtime_version: string;
    incrementality?: string;
    timestamp?: number;
  };
  entity: FeedEntity[];
}
