export interface ApiItemsData {
  name: string;
  value: string;
  type: string;
}

export interface ApiResponse {
  collection?: {
    items: Array<{
      data: Array<ApiItemsData>;
    }>;
  };
}

export interface DivisionLocationDTO {
  id?: number;
  type?: string;
  address?: string;
  name?: string;
  notes?: string;
  phone?: string;
  division_id?: number;
  url?: string;
}

export interface EventDTO {
  id?: number;
  division_location_id?: number;
  is_canceled?: boolean;
  is_game?: boolean;
  is_tbd?: boolean;
  location_id?: number;
  name?: string;
  opponent_id?: number;
  points_for_opponent?: number;
  points_for_team?: number;
  start_date?: string;
  team_id?: number;
  time_zone_iana_name?: string;
}

export interface TeamDTO {
  id?: number;
  division_name?: string;
  division_id?: number;
  is_retired?: boolean;
  name?: string;
  season_name?: string;
  time_zone_iana_name?: number;
}
