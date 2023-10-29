import { toEventDTO } from '../mappers/event-mapper';
import type { ApiResponse } from './types';

export const getEvent = async (teamSnapClientId: string, id: number) => {
  const response = await fetch(`https://api.teamsnap.com/v3/events/${id}`, {
    headers: [
      ['X-Teamsnap-Client-Id', teamSnapClientId],
      ['Accept', 'application/vnd.collection+json'],
    ],
  });

  const jsonResponse = (await response.json()) as ApiResponse;
  return (
    jsonResponse.collection?.items
      .map(({ data }) => toEventDTO(data))
      .find((o) => true) ?? null
  );
};

export const searchEvents = async (
  teamSnapClientId: string,
  query?: {
    ids?: number[];
    teamIds?: number[];
    startedAfter?: Date;
  }
) => {
  const response = await fetch(
    `https://api.teamsnap.com/v3/events/search?id=${
      query?.ids?.join(',') ?? ''
    }&team_id=${query?.teamIds?.join(',') ?? ''}&started_after=${
      query?.startedAfter?.toISOString() ?? ''
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
    jsonResponse.collection?.items.map(({ data }) => toEventDTO(data)) ?? []
  );
};
