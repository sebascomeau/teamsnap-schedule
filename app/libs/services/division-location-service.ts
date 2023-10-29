import { toDivisionLocationDTO } from '../mappers/division-location-mapper';
import type { ApiResponse } from './types';

export const getDivisionLocation = async (
  teamSnapClientId: string,
  id: number
) => {
  const response = await fetch(
    `https://api.teamsnap.com/v3/division_locations/${id}`,
    {
      headers: [
        ['X-Teamsnap-Client-Id', teamSnapClientId],
        ['Accept', 'application/vnd.collection+json'],
      ],
    }
  );

  const jsonResponse = (await response.json()) as ApiResponse;
  return (
    jsonResponse.collection?.items
      .map(({ data }) => toDivisionLocationDTO(data))
      .find((o) => true) ?? null
  );
};

export const searchDivisionLocations = async (
  teamSnapClientId: string,
  query?: {
    ids?: number[];
  }
) => {
  const response = await fetch(
    `https://api.teamsnap.com/v3/division_locations/search?id=${
      query?.ids?.join(',') ?? ''
    }`,
    {
      headers: [
        ['X-Teamsnap-Client-Id', teamSnapClientId],
        ['Accept', 'application/vnd.collection+json'],
      ],
    }
  );

  const jsonResponse = (await response.json()) as ApiResponse;
  return (
    jsonResponse.collection?.items.map(({ data }) =>
      toDivisionLocationDTO(data)
    ) ?? []
  );
};
