import type { ApiItemsData, EventDTO } from '../services/types';
import { tryGetDataValue } from './mapper-utils';

export const toEventDTO = (data: ApiItemsData[]): EventDTO => ({
  id: tryGetDataValue(data, 'id') as number,
  division_location_id: tryGetDataValue(data, 'division_location_id'),
  is_canceled: tryGetDataValue(data, 'is_canceled'),
  is_game: tryGetDataValue(data, 'is_game'),
  is_tbd: tryGetDataValue(data, 'is_tbd'),
  location_id: tryGetDataValue(data, 'location_id'),
  name: tryGetDataValue(data, 'name'),
  opponent_id: tryGetDataValue(data, 'opponent_id'),
  points_for_opponent: tryGetDataValue(data, 'points_for_opponent'),
  points_for_team: tryGetDataValue(data, 'points_for_team'),
  start_date: tryGetDataValue(data, 'start_date'),
  team_id: tryGetDataValue(data, 'team_id'),
  time_zone_iana_name: tryGetDataValue(data, 'time_zone_iana_name'),
});
