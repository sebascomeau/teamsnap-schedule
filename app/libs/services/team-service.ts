import { toTeamDTO } from '../mappers/team-mapper';
import { getRootDivision } from './division-service';
import type { ApiResponse, TeamDTO } from './types';

export const getTeam = async (teamSnapClientId: string, id: number) => {
  const response = await fetch(`https://api.teamsnap.com/v3/teams/${id}`, {
    headers: [
      ['X-Teamsnap-Client-Id', teamSnapClientId],
      ['Accept', 'application/vnd.collection+json'],
    ],
  });

  if (!response.ok) {
    return null;
  }

  const jsonResponse = (await response.json()) as ApiResponse;
  return (
    jsonResponse.collection.items
      ?.map(({ data }) => toTeamDTO(data))
      .find((o) => true) ?? null
  );
};

export const getTeamAll = (division_id: number) =>
  ({
    id: -1,
    name: 'All/Tous',
    division_id,
  } as const satisfies TeamDTO);

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

  if (!response.ok) {
    return [];
  }

  const jsonResponse = (await response.json()) as ApiResponse;
  return (
    jsonResponse.collection.items?.map(({ data }) => toTeamDTO(data)) ?? []
  );
};

export const searchTeamsByDivisionId = async (
  teamSnapClientId: string,
  divisionId: number
) => {
  const response = await fetch(
    `https://apiv3.teamsnap.com/teams/division_search?division_id=${divisionId}&is_active=true`,
    {
      headers: [
        ['X-Teamsnap-Client-Id', teamSnapClientId],
        ['Accept', 'application/vnd.collection+json'],
      ],
    }
  );

  if (!response.ok) {
    return [];
  }

  const jsonResponse = (await response.json()) as ApiResponse;
  return (
    jsonResponse.collection.items?.map(({ data }) => toTeamDTO(data)) ?? []
  );
};

// use for caching - need a better way
let getRootDivisionTeamsCache: Array<TeamDTO> | undefined;
export const getRootDivisionTeams = async (
  teamSnapClientId: string,
  rootDivisionId: number
) => {
  if (typeof getRootDivisionTeamsCache !== 'undefined')
    return getRootDivisionTeamsCache;

  const rootDivision = await getRootDivision(teamSnapClientId, rootDivisionId);
  if (rootDivision === null) return [];

  getRootDivisionTeamsCache = await searchTeamsByDivisionId(
    teamSnapClientId,
    rootDivision.id
  );

  // add team all
  getRootDivisionTeamsCache.push(getTeamAll(rootDivisionId));

  return getRootDivisionTeamsCache;
};

export const isTeamAll = (team: TeamDTO) => team.id === -1;
