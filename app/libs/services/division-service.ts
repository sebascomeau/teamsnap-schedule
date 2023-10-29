import { toDivisionDTO } from '../mappers/division-mapper';
import type { ApiResponse } from './types';

export const getDivision = async (teamSnapClientId: string, id: number) => {
  const response = await fetch(`https://api.teamsnap.com/v3/divisions/${id}`, {
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
      ?.map(({ data }) => toDivisionDTO(data))
      .find((o) => true) ?? null
  );
};

export const getDivisionTree = async (teamSnapClientId: string, id: number) => {
  const response = await fetch(
    `https://apiv3.teamsnap.com/v3/divisions/tree?id=${id}`,
    {
      headers: [
        ['X-Teamsnap-Client-Id', teamSnapClientId],
        ['Accept', 'application/vnd.collection+json'],
      ],
    }
  );

  const jsonResponse = (await response.json()) as ApiResponse;
  return (
    jsonResponse.collection.items?.map(({ data }) => toDivisionDTO(data)) ?? []
  );
};
