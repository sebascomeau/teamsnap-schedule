import { cachified } from "cachified";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { lruCache as cache, defaultTtl as ttl } from "../utils/cache-utils";
import type { Config } from "../config";
import { toEventDTO } from "../mappers/event-mapper";
import { convertUTCDateStringToTimeZone } from "../utils/date-utils";
import type { ApiResponse, EventByWeek, EventDTO } from "./types";
import urlcat from "urlcat";

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
          },
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
    startedBefore?: Date;
  }) => {
    const params = {
      id: query?.ids?.join(","),
      team_id: query?.teamIds?.join(","),
      started_after: query?.startedAfter?.toISOString(),
      started_before: query?.startedBefore?.toISOString(),
    };

    const url = urlcat(
      "https://api.teamsnap.com/",
      "/v3/events/search",
      params,
    );

    console.log({ url });

    return cachified({
      key: url,
      cache,
      getFreshValue: async () => {
        const response = await fetch(url, {
          headers: [
            ["X-Teamsnap-Client-Id", dependencies.config.TEAMSNAP_CLIENT_ID],
            ["Accept", "application/vnd.collection+json"],
          ],
        });

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
      event.time_zone_iana_name,
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

  events.forEach((event) => {
    const startDate = convertEventStartDate(event);
    if (startDate) {
      const weekStart = startOfWeek(startDate);
      const weekStartDateString = weekStart.toISOString();
      if (!eventsByWeek[weekStartDateString]) {
        eventsByWeek[weekStartDateString] = {};
      }

      let currentDay = new Date(weekStart); // Initialize to the start of the week
      for (let i = 0; i < 7; i++) {
        // Loop through each day of the week
        const dayString = format(currentDay, "yyyy-MM-dd");
        if (!eventsByWeek[weekStartDateString][dayString]) {
          eventsByWeek[weekStartDateString][dayString] = [];
        }
        currentDay = addDays(currentDay, 1); // Move to the next day
      }

      const day = format(startDate, "yyyy-MM-dd");
      eventsByWeek[weekStartDateString][day].push(event);
    }
  });

  return eventsByWeek;
};
