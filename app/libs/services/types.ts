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

export interface DivisionDTO {
  id?: number | null;
  persistent_uuid?: number | null;
  formatted_persistent_uuid?: string | null;
  parent_id?: number | null;
  name?: string | null;
  season_name?: string | null;
  is_archived?: boolean | null;
  time_zone_iana_name?: string | null;
}

export interface DivisionLocationDTO {
  id?: number | null;
  type?: string | null;
  address?: string | null;
  name?: string | null;
  notes?: string | null;
  phone?: string | null;
  division_id?: number | null;
  url?: string | null;
}

export interface EventDTO {
  id?: number | null;
  division_location_id?: number | null;
  is_canceled?: boolean | null;
  is_game?: boolean | null;
  is_tbd?: boolean | null;
  location_id?: number | null;
  name?: string | null;
  opponent_id?: number | null;
  points_for_opponent?: number | null;
  points_for_team?: number | null;
  start_date?: string | null;
  team_id?: number | null;
  time_zone_iana_name?: string | null;
}

export interface TeamDTO {
  id?: number | null;
  division_name?: string | null;
  division_id?: number | null;
  is_retired?: boolean | null;
  name?: string | null;
  season_name?: string | null;
  time_zone_iana_name?: number | null;
}
