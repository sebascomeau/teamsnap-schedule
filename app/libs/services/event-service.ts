import { format, parseISO, startOfWeek } from 'date-fns';
import { toEventDTO } from '../mappers/event-mapper';
import { convertUTCDateStringToTimeZone } from '../utils/date-utils';
import type { ApiResponse, EventByWeek, EventDTO } from './types';

export const getEvent = async (teamSnapClientId: string, id: number) => {
  const response = await fetch(`https://api.teamsnap.com/v3/events/${id}`, {
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
      ?.map(({ data }) => toEventDTO(data))
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

  if (!response.ok) {
    return [];
  }

  const jsonResponse = (await response.json()) as ApiResponse;
  return (
    jsonResponse.collection.items?.map(({ data }) => toEventDTO(data)) ?? []
  );
};

export const isGameEvent = (event: EventDTO) =>
  event?.is_game === true ||
  (event.name?.match(/ vs /i) ?? false) ||
  (event.name?.match(/ @ /i) ?? false);

export const convertEventStartDate = (event: EventDTO) => {
  if (!event.start_date) {
    return undefined;
  }

  if (event.time_zone_iana_name) {
    return convertUTCDateStringToTimeZone(
      event.start_date,
      event.time_zone_iana_name
    );
  }

  return parseISO(event.start_date);
};

/**
 * Groups events by week and day based on the start_date
 * @param events - An array of Event objects.
 * @returns An object organizing events by week and day.
 */
export const groupEventsByWeek = (events: EventDTO[]) => {
  const eventsByWeek: EventByWeek = {};

  // Group events by week, then by day within each week
  events.forEach((event) => {
    const startDate = convertEventStartDate(event);
    if (startDate) {
      const weekStart = startOfWeek(startDate);
      const weekStartDateString = weekStart.toISOString();
      if (!eventsByWeek[weekStartDateString]) {
        eventsByWeek[weekStartDateString] = {};
      }

      const day = format(startDate, 'yyyy-MM-dd');
      if (!eventsByWeek[weekStartDateString][day]) {
        eventsByWeek[weekStartDateString][day] = [];
      }

      eventsByWeek[weekStartDateString][day].push(event);
    }
  });

  return eventsByWeek;
};
