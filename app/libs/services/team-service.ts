import type { Config } from '../config';
import { toTeamDTO } from '../mappers/team-mapper';
import type { DivisionServiceReturnType } from './division-service';
import type { ApiResponse, TeamDTO } from './types';

let getRootDivisionTeamsCache: Array<TeamDTO> | undefined;

export const TEAM_ALL_ID = -1;

export interface TeamServiceDependencies {
  readonly config: Config;
  readonly divisionService: DivisionServiceReturnType;
}

export const TeamService = (dependencies: TeamServiceDependencies) => {
  const getTeam = async (id: number) => {
    const response = await fetch(`https://api.teamsnap.com/v3/teams/${id}`, {
      headers: [
        ['X-Teamsnap-Client-Id', dependencies.config.TEAMSNAP_CLIENT_ID],
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

  const getTeamAll = () =>
    ({
      division_id: dependencies.config.TEAMSNAP_ROOT_DIVISION_ID,
      id: TEAM_ALL_ID,
      name: 'All/Tous',
    } as const satisfies TeamDTO);

  const searchTeams = async (query?: { ids?: number[] }) => {
    const response = await fetch(
      `https://api.teamsnap.com/v3/teams/search?id=${
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
      jsonResponse.collection.items?.map(({ data }) => toTeamDTO(data)) ?? []
    );
  };

  const searchTeamsByDivisionId = async (divisionId: number) => {
    const response = await fetch(
      `https://apiv3.teamsnap.com/teams/division_search?division_id=${divisionId}&is_active=true`,
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
      jsonResponse.collection.items?.map(({ data }) => toTeamDTO(data)) ?? []
    );
  };

  // use for caching - need a better way
  const getRootDivisionTeams = async () => {
    if (typeof getRootDivisionTeamsCache !== 'undefined')
      return getRootDivisionTeamsCache;

    const rootDivision = await dependencies.divisionService.getRootDivision();
    if (rootDivision === null) return [];

    console.log('searchTeamsByDivisionId');
    getRootDivisionTeamsCache = await searchTeamsByDivisionId(
      dependencies.config.TEAMSNAP_ROOT_DIVISION_ID
    );

    // add team all
    getRootDivisionTeamsCache.push(getTeamAll());

    return getRootDivisionTeamsCache;
  };

  return {
    getRootDivisionTeams,
    getTeam,
    getTeamAll,
    searchTeams,
    searchTeamsByDivisionId,
  };
};

export const isTeamAll = (team: TeamDTO) => team.id === TEAM_ALL_ID;
