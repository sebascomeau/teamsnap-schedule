import { toTeamDTO } from '../mappers/team-mapper';
import type { ApiResponse } from './types';

export const getTeam = async (teamSnapClientId: string, id: number) => {
  const response = await fetch(`https://api.teamsnap.com/v3/teams/${id}`, {
    headers: [
      ['X-Teamsnap-Client-Id', teamSnapClientId],
      ['Accept', 'application/vnd.collection+json'],
    ],
  });

  const jsonResponse = (await response.json()) as ApiResponse;
  return (
    jsonResponse.collection?.items
      .map(({ data }) => toTeamDTO(data))
      .find((o) => true) ?? null
  );
};

export const searchTeams = async (
  teamSnapClientId: string,
  query?: {
    ids?: number[];
  }
) => {
  const response = await fetch(
    `https://api.teamsnap.com/v3/teams/search?id=${
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
    jsonResponse.collection?.items.map(({ data }) => toTeamDTO(data)) ?? []
  );
};
