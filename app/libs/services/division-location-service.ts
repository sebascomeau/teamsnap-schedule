import type { Config } from '../config';
import { toDivisionLocationDTO } from '../mappers/division-location-mapper';
import type { ApiResponse } from './types';

export interface DivisionLocationServiceDependencies {
  readonly config: Config;
}

export const DivisionLocationService = (
  dependencies: DivisionLocationServiceDependencies
) => {
  const getDivisionLocation = async (id: number) => {
    const response = await fetch(
      `https://api.teamsnap.com/v3/division_locations/${id}`,
      {
        headers: [
          ['X-Teamsnap-Client-Id', dependencies.config.TEAMSNAP_CLIENT_ID],
          ['Accept', 'application/vnd.collection+json'],
        ],
      }
    );

    if (!response.ok) {
      return null;
    }

    const jsonResponse = (await response.json()) as ApiResponse;
    return (
      jsonResponse.collection.items
        ?.map(({ data }) => toDivisionLocationDTO(data))
        .find((o) => true) ?? null
    );
  };

  const searchDivisionLocations = async (query?: { ids?: number[] }) => {
    const response = await fetch(
      `https://api.teamsnap.com/v3/division_locations/search?id=${
        query?.ids?.join(',') ?? ''
      }`,
      {
        headers: [
          ['X-Teamsnap-Client-Id', dependencies.config.TEAMSNAP_CLIENT_ID],
          ['Accept', 'application/vnd.collection+json'],
        ],
      }
    );

    if (!response.ok) {
      return [];
    }

    const jsonResponse = (await response.json()) as ApiResponse;
    return (
      jsonResponse.collection.items?.map(({ data }) =>
        toDivisionLocationDTO(data)
      ) ?? []
    );
  };

  return {
    getDivisionLocation,
    searchDivisionLocations,
  };
};
