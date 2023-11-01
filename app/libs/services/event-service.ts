import { cachified } from "cachified";
import { format, parseISO, startOfWeek } from "date-fns";
import {
  lruCache as cache,
  defaultTtl as ttl,
} from "../../libs/utils/cache-utils";
import type { Config } from "../config";
import { toEventDTO } from "../mappers/event-mapper";
import { convertUTCDateStringToTimeZone } from "../utils/date-utils";
import type { ApiResponse, EventByWeek, EventDTO } from "./types";

export interface EventServiceDependencies {
  readonly config: Config;
}

export const EventService = (dependencies: EventServiceDependencies) => {
  const getEvent = async (id: number) => {
    return cachified({
      key: `getEvent-${id}`,
      cache,
      getFreshValue: async () => {
        const response = await fetch(
          `https://api.teamsnap.com/v3/events/${id}`,
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
            ?.map(({ data }) => toEventDTO(data))
            .find((o) => true) ?? null
        );
      },
      ttl,
    });
  };

  const searchEvents = async (query?: {
    ids?: number[];
    teamIds?: number[];
    startedAfter?: Date;
  }) => {
    const id = query?.ids?.join(",") ?? "";
    const teamId = query?.teamIds?.join(",") ?? "";
    const startedAfter = query?.startedAfter?.toISOString() ?? "";

    return cachified({
      key: `searchEvents-${id}-${teamId}-${startedAfter}`,
      cache,
      getFreshValue: async () => {
        const response = await fetch(
          `https://api.teamsnap.com/v3/events/search?id=${id}&team_id=${teamId}&started_after=${startedAfter}`,
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
          jsonResponse.collection.items?.map(({ data }) => toEventDTO(data)) ??
          []
        );
      },
      ttl,
    });
  };

  return {
    getEvent,
    searchEvents,
  };
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

      const day = format(startDate, "yyyy-MM-dd");
      if (!eventsByWeek[weekStartDateString][day]) {
        eventsByWeek[weekStartDateString][day] = [];
      }

      eventsByWeek[weekStartDateString][day].push(event);
    }
  });

  return eventsByWeek;
};
