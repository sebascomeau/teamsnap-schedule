import type { ApiItemsData, DivisionDTO } from '../services/types';
import { tryGetDataValue } from './mapper-utils';

export const toDivisionDTO = (data: ApiItemsData[]): DivisionDTO => ({
  id: tryGetDataValue(data, 'id') as number,
  persistent_uuid: tryGetDataValue(data, 'id'),
  formatted_persistent_uuid: tryGetDataValue(data, 'formatted_persistent_uuid'),
  parent_id: tryGetDataValue(data, 'parent_id'),
  name: tryGetDataValue(data, 'name'),
  season_name: tryGetDataValue(data, 'season_name'),
  is_archived: tryGetDataValue(data, 'is_archived'),
  time_zone_iana_name: tryGetDataValue(data, 'time_zone_iana_name'),
});
