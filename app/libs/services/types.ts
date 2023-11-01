export interface ApiItemsData {
  readonly name: string;
  readonly type: string;
  readonly value: string;
}

export interface ApiResponse {
  readonly collection: {
    readonly items?: Array<{
      readonly data: Array<ApiItemsData>;
    }>;
  };
}

export interface DivisionDTO {
  readonly formatted_persistent_uuid?: string | null;
  readonly id: number;
  readonly is_archived?: boolean | null;
  readonly name?: string | null;
  readonly parent_id?: number | null;
  readonly persistent_uuid?: number | null;
  readonly season_name?: string | null;
  readonly time_zone_iana_name?: string | null;
}

export interface DivisionLocationDTO {
  readonly address?: string | null;
  readonly division_id?: number | null;
  readonly id: number;
  readonly name?: string | null;
  readonly notes?: string | null;
  readonly phone?: string | null;
  readonly type?: string | null;
  readonly url?: string | null;
}

export interface EventDTO {
  readonly division_location_id?: number | null;
  readonly id: number;
  readonly is_canceled?: boolean | null;
  readonly is_game?: boolean | null;
  readonly is_tbd?: boolean | null;
  readonly location_id?: number | null;
  readonly name?: string | null;
  readonly opponent_id?: number | null;
  readonly points_for_opponent?: number | null;
  readonly points_for_team?: number | null;
  readonly start_date?: string | null;
  readonly team_id?: number | null;
  readonly time_zone_iana_name?: string | null;
}

export interface EventByDay {
  [day: string]: EventDTO[];
}

export interface EventByWeek {
  [weekStart: string]: EventByDay;
}

export interface TeamDTO {
  readonly division_id?: number | null;
  readonly division_name?: string | null;
  readonly id: number;
  readonly is_retired?: boolean | null;
  readonly name?: string | null;
  readonly season_name?: string | null;
  readonly time_zone_iana_name?: string | null;
}
