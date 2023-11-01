import type { Config } from '../config';
import { toDivisionDTO } from '../mappers/division-mapper';
import type { ApiResponse, DivisionDTO } from './types';

let getRootDivisionCache: DivisionDTO | undefined | null;

export interface DivisionServiceDependencies {
  readonly config: Config;
}

export type DivisionServiceReturnType = ReturnType<typeof DivisionService>;

export const DivisionService = (dependencies: DivisionServiceDependencies) => {
  const getDivision = async (id: number) => {
    const response = await fetch(
      `https://api.teamsnap.com/v3/divisions/${id}`,
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
        ?.map(({ data }) => toDivisionDTO(data))
        .find((o) => true) ?? null
    );
  };

  // use for caching - need a better way
  const getRootDivision = async () => {
    if (typeof getRootDivisionCache !== 'undefined')
      return getRootDivisionCache;
    getRootDivisionCache = await getDivision(
      dependencies.config.TEAMSNAP_ROOT_DIVISION_ID
    );
    return getRootDivisionCache;
  };

  const getDivisionTree = async (id: number) => {
    const response = await fetch(
      `https://apiv3.teamsnap.com/v3/divisions/tree?id=${id}`,
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
      jsonResponse.collection.items?.map(({ data }) => toDivisionDTO(data)) ??
      []
    );
  };

  return {
    getDivision,
    getDivisionTree,
    getRootDivision,
  };
};
