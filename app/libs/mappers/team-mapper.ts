import type { ApiItemsData, TeamDTO } from '../services/types';
import { tryGetDataValue } from './mapper-utils';

export const toTeamDTO = (data: ApiItemsData[]): TeamDTO => ({
  id: tryGetDataValue(data, 'id'),
  division_name: tryGetDataValue(data, 'division_name'),
  division_id: tryGetDataValue(data, 'division_id'),
  is_retired: tryGetDataValue(data, 'is_retired'),
  name: tryGetDataValue(data, 'name'),
  season_name: tryGetDataValue(data, 'season_name'),
  time_zone_iana_name: tryGetDataValue(data, 'time_zone_iana_name'),
});
