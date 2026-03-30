// GTFS Static types
export interface GtfsRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: number;
  agency_id: string;
}

export interface GtfsStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
}

export interface GtfsStopTime {
  trip_id: string;
  arrival_time: string; // HH:MM:SS (may exceed 23:xx for overnight)
  stop_id: string;
}

export interface GtfsTrip {
  trip_id: string;
  route_id: string;
  direction_id: number;
  trip_headsign: string;
  service_id: string;
  shape_id: string;
}
