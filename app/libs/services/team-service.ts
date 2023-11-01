import { cachified } from "cachified";
import {
  lruCache as cache,
  defaultTtl as ttl,
} from "../../libs/utils/cache-utils";
import type { Config } from "../config";
import { toTeamDTO } from "../mappers/team-mapper";
import type { DivisionServiceReturnType } from "./division-service";
import type { ApiResponse, TeamDTO } from "./types";

export const TEAM_ALL_ID = -1;

export interface TeamServiceDependencies {
  readonly config: Config;
  readonly divisionService: DivisionServiceReturnType;
}

export const TeamService = (dependencies: TeamServiceDependencies) => {
  const getTeam = async (id: number) => {
    return cachified({
      key: `getTeam-${id}`,
      cache,
      getFreshValue: async () => {
        const response = await fetch(
          `https://api.teamsnap.com/v3/teams/${id}`,
          {
            headers: [
              ["X-Teamsnap-Client-Id", dependencies.config.TEAMSNAP_CLIENT_ID],
              ["Accept", "application/vnd.collection+json"],
            ],
          }
        );

        if (!response.ok) {
          return null;
        }

        const jsonResponse = (await response.json()) as ApiResponse;
        return (
          jsonResponse.collection.items
            ?.map(({ data }) => toTeamDTO(data))
            .find((o) => true) ?? null
        );
      },
      ttl,
    });
  };

  const getTeamAll = () =>
    ({
      division_id: dependencies.config.TEAMSNAP_ROOT_DIVISION_ID,
      id: TEAM_ALL_ID,
      name: "All/Tous",
    } as const satisfies TeamDTO);

  const searchTeams = async (query?: { ids?: number[] }) => {
    const id = query?.ids?.join(",") ?? "";

    return cachified({
      key: `searchTeams-${id}`,
      cache,
      getFreshValue: async () => {
        const response = await fetch(
          `https://api.teamsnap.com/v3/teams/search?id=${id}`,
          {
            headers: [
              ["X-Teamsnap-Client-Id", dependencies.config.TEAMSNAP_CLIENT_ID],
              ["Accept", "application/vnd.collection+json"],
            ],
          }
        );

        if (!response.ok) {
          return [];
        }

        const jsonResponse = (await response.json()) as ApiResponse;
        return (
          jsonResponse.collection.items?.map(({ data }) => toTeamDTO(data)) ??
          []
        );
      },
      ttl,
    });
  };

  const searchTeamsByDivisionId = async (divisionId: number) => {
    return cachified({
      key: `searchTeamsByDivisionId-${divisionId}`,
      cache,
      getFreshValue: async () => {
        const response = await fetch(
          `https://apiv3.teamsnap.com/teams/division_search?division_id=${divisionId}&is_active=true`,
          {
            headers: [
              ["X-Teamsnap-Client-Id", dependencies.config.TEAMSNAP_CLIENT_ID],
              ["Accept", "application/vnd.collection+json"],
            ],
          }
        );

        if (!response.ok) {
          return [];
        }

        const jsonResponse = (await response.json()) as ApiResponse;
        const teams =
          jsonResponse.collection.items?.map(({ data }) => toTeamDTO(data)) ??
          [];

        if (divisionId === dependencies.config.TEAMSNAP_ROOT_DIVISION_ID) {
          teams.unshift(getTeamAll());
        }

        return teams;
      },
      ttl,
    });
  };

  const getRootDivisionTeams = async () => {
    return await searchTeamsByDivisionId(
      dependencies.config.TEAMSNAP_ROOT_DIVISION_ID
    );
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
