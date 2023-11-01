import { cachified } from "cachified";
import {
  lruCache as cache,
  defaultTtl as ttl,
} from "../../libs/utils/cache-utils";
import type { Config } from "../config";
import { toDivisionDTO } from "../mappers/division-mapper";
import type { ApiResponse } from "./types";

export interface DivisionServiceDependencies {
  readonly config: Config;
}

export type DivisionServiceReturnType = ReturnType<typeof DivisionService>;

export const DivisionService = (dependencies: DivisionServiceDependencies) => {
  const getDivision = async (id: number) => {
    return cachified({
      key: `getDivision-${id}`,
      cache,
      getFreshValue: async () => {
        const response = await fetch(
          `https://api.teamsnap.com/v3/divisions/${id}`,
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
            ?.map(({ data }) => toDivisionDTO(data))
            .find((o) => true) ?? null
        );
      },
      ttl,
    });
  };

  const getRootDivision = async () => {
    return await getDivision(dependencies.config.TEAMSNAP_ROOT_DIVISION_ID);
  };

  const getDivisionTree = async (id: number) => {
    return cachified({
      key: `getDivisionTree-${id}`,
      cache,
      getFreshValue: async () => {
        const response = await fetch(
          `https://apiv3.teamsnap.com/v3/divisions/tree?id=${id}`,
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
          jsonResponse.collection.items?.map(({ data }) =>
            toDivisionDTO(data)
          ) ?? []
        );
      },
      ttl,
    });
  };

  return {
    getDivision,
    getDivisionTree,
    getRootDivision,
  };
};
