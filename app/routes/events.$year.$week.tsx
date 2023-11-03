import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { addDays, format } from "date-fns";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { GameTag } from "~/components/GameTag";
import type { Loader as RootLoader } from "../root";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getConfig } from "~/libs/config";
import { DivisionLocationService } from "~/libs/services/division-location-service";
import { DivisionService } from "~/libs/services/division-service";
import {
  EventService,
  convertEventStartDate,
  groupEventsByWeek,
  isGameEvent,
} from "~/libs/services/event-service";
import { TeamService } from "~/libs/services/team-service";

import {
  getStartAndEndDateFromYearAndWeek,
  isValidYearAndWeek,
  parseDateStringToDate,
} from "~/libs/utils/date-utils";
import { removeNullOrUndefined } from "~/libs/utils/misc-utils";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const year = parseInt(params.year ?? "", 10);
  const week = parseInt(params.week ?? "", 10);

  console.log({ year, week, valide: isValidYearAndWeek(year, week) });

  if (!isValidYearAndWeek(year, week)) {
    // not found
    throw json(`Events Year ${params.year} Week ${params.week} Not Found`, {
      status: 404,
    });
  }

  // get week start and end daate
  const weekStartAndEnDate = getStartAndEndDateFromYearAndWeek(year, week);

  if (!weekStartAndEnDate) {
    // not found
    throw json(`Events Year ${params.year} Week ${params.week} Not Found`, {
      status: 404,
    });
  }

  const config = getConfig();
  const divisionService = DivisionService({ config });
  const divisionLocationService = DivisionLocationService({ config });
  const eventService = EventService({ config });
  const teamService = TeamService({ config, divisionService });
  const team = teamService.getTeamAll();

  // get week's events
  const events = await eventService.searchEvents({
    startedAfter: weekStartAndEnDate.start,
    startedBefore: weekStartAndEnDate.end,
  });

  // search event's division locations
  const divisionLocationIds = removeNullOrUndefined(
    events.map(({ division_location_id }) => division_location_id),
  );
  const divisionLocations =
    await divisionLocationService.searchDivisionLocations({
      ids: divisionLocationIds,
    });

  // search event's teams
  const teamIds = removeNullOrUndefined(events.map(({ team_id }) => team_id));
  const teams = await teamService.searchTeams({ ids: teamIds });

  return json({
    divisionLocations,
    events,
    team,
    teams,
  });
};

export type Loader = typeof loader;

export default function Events() {
  const data = useLoaderData<Loader>();
  const rootRouteData = useRouteLoaderData<RootLoader>("root");
  const eventsByWeek = groupEventsByWeek(data.events);

  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {"All Teams Events"}
      </h1>
      <p className="text-lg text-muted-foreground">
        <span className="font-semibold">{data.events.length}</span> upcoming
        events for the {rootRouteData?.rootDivision.season_name} season.
      </p>

      {Object.entries(eventsByWeek).map(([weekStart, eventsByDay]) => {
        const startDate = new Date(weekStart);
        const endDate = addDays(startDate, 6);
        return (
          <div key={"week-" + weekStart}>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-8 mb-6">
              Week {format(startDate, "MMM dd")} - {format(endDate, "MMM dd")}
            </h2>
            {Object.entries(eventsByDay).map(([day, events]) => {
              const parsedDay = parseDateStringToDate(day);
              if (!parsedDay) return null;
              return (
                <div key={day}>
                  <h3 className="flex gap-1 items-center scroll-m-20 text-2xl font-semibold tracking-tight mt-6 mb-4">
                    <CalendarDays />
                    <span>{format(parsedDay, "iiii, MMMM do")}</span>
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No event found
                      </p>
                    )}
                    {events.map((event) => {
                      const startDate = convertEventStartDate(event);
                      const team = data.teams.find(
                        ({ id }) => id === event.team_id,
                      );
                      const divisionLocation = data.divisionLocations.find(
                        ({ id }) => id === event.division_location_id,
                      );
                      return (
                        <Card key={event.id}>
                          <CardHeader>
                            <CardTitle className="flex gap-1">
                              <Clock size={16} />
                              <span>
                                {startDate && format(startDate, "hh:mm aa")} -{" "}
                                {event.name}
                              </span>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Link to={`/teams/${team?.id}`}>
                                {team?.name}
                              </Link>
                              {isGameEvent(event) && <GameTag />}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {divisionLocation && (
                              <div className="space-y-1">
                                <div className="flex gap-1">
                                  <MapPin size={16} />
                                  <p className="text-sm font-medium leading-none">
                                    {divisionLocation.name}
                                  </p>
                                </div>
                                {divisionLocation.address && (
                                  <p className="text-sm text-muted-foreground">
                                    {divisionLocation.address}
                                  </p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
