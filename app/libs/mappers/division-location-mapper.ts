import type { ApiItemsData, DivisionLocationDTO } from '../services/types';
import { tryGetDataValue } from './mapper-utils';

export const toDivisionLocationDTO = (
  data: ApiItemsData[]
): DivisionLocationDTO => ({
  id: tryGetDataValue(data, 'id'),
  type: tryGetDataValue(data, 'type'),
  address: tryGetDataValue(data, 'address'),
  name: tryGetDataValue(data, 'name'),
  notes: tryGetDataValue(data, 'notes'),
  phone: tryGetDataValue(data, 'phone'),
  division_id: tryGetDataValue(data, 'division_id'),
  url: tryGetDataValue(data, 'url'),
});
