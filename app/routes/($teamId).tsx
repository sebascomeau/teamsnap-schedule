import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { addDays, format } from 'date-fns';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { GameTag } from '~/components/GameTag';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { config } from '~/libs/config';
import { searchDivisionLocations } from '~/libs/services/division-location-service';
import { getRootDivision } from '~/libs/services/division-service';
import {
  convertEventStartDate,
  groupEventsByWeek,
  isGameEvent,
  searchEvents,
} from '~/libs/services/event-service';
import {
  getRootDivisionTeams,
  getTeam,
  getTeamAll,
  isTeamAll,
  searchTeams,
} from '~/libs/services/team-service';

import { parseDateStringToDate } from '~/libs/utils/date-utils';
import { removeNullOrUndefined } from '~/libs/utils/misc-utils';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const appConfig = config();
  const teamAll = getTeamAll(appConfig.TEAMSNAP_ROOT_DIVISION_ID);

  // get root division
  const rootDivision = await getRootDivision(
    appConfig.TEAMSNAP_CLIENT_ID,
    appConfig.TEAMSNAP_ROOT_DIVISION_ID
  );
  if (rootDivision === null) {
    throw new Response('Root Division Not Found', { status: 404 });
  }

  // undefined means all teams
  const team = params.teamId
    ? await getTeam(
        appConfig.TEAMSNAP_CLIENT_ID,
        Number.parseInt(params.teamId)
      )
    : teamAll;

  if (team === null) {
    // not found
    throw new Response('Team Not Found', { status: 404 });
  }

  // Get today's date
  const today = new Date();

  // Set the time to zero (midnight)
  today.setHours(0, 0, 0, 0);

  const searchEventsTeamIds =
    team.id === teamAll.id
      ? (
          await getRootDivisionTeams(
            appConfig.TEAMSNAP_CLIENT_ID,
            appConfig.TEAMSNAP_ROOT_DIVISION_ID
          )
        ).map(({ id }) => id)
      : [team.id];
  const events = await searchEvents(appConfig.TEAMSNAP_CLIENT_ID, {
    teamIds: searchEventsTeamIds,
    startedAfter: today,
  });

  // search event's division locations
  const divisionLocationIds = removeNullOrUndefined(
    events.map(({ division_location_id }) => division_location_id)
  );
  const divisionLocations = await searchDivisionLocations(
    appConfig.TEAMSNAP_CLIENT_ID,
    {
      ids: divisionLocationIds,
    }
  );

  // search event's teams
  const teamIds = removeNullOrUndefined(events.map(({ team_id }) => team_id));
  const teams = await searchTeams(appConfig.TEAMSNAP_CLIENT_ID, {
    ids: teamIds,
  });

  return json({
    divisionLocations,
    events,
    rootDivision,
    team,
    teams,
  });
};

export default function Events() {
  const data = useLoaderData<typeof loader>();
  const eventsByWeek = groupEventsByWeek(data.events);

  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {isTeamAll(data.team)
          ? 'All Teams Events'
          : `${data.team.name} Team Events`}
      </h1>
      <p className="text-lg text-muted-foreground">
        <span className="font-semibold">{data.events.length}</span> upcoming
        events for the {data.rootDivision.season_name} season.
      </p>

      {Object.entries(eventsByWeek).map(([weekStart, eventsByDay]) => {
        const startDate = new Date(weekStart);
        const endDate = addDays(startDate, 6);
        return (
          <div key={'week-' + weekStart}>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-8 mb-6">
              Week {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}
            </h2>
            {Object.entries(eventsByDay).map(([day, events]) => {
              const parsedDay = parseDateStringToDate(day);
              return (
                <div key={day}>
                  {parsedDay && (
                    <h3 className="flex gap-1 items-center scroll-m-20 text-2xl font-semibold tracking-tight mt-6 mb-4">
                      <CalendarDays />
                      <span>{format(parsedDay, 'iiii, MMMM do')}</span>
                    </h3>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((event) => {
                      const startDate = convertEventStartDate(event);
                      const team = data.teams.find(
                        ({ id }) => id === event.team_id
                      );
                      const divisionLocation = data.divisionLocations.find(
                        ({ id }) => id === event.division_location_id
                      );
                      return (
                        <Card key={event.id}>
                          <CardHeader>
                            <CardTitle className="flex gap-1">
                              <Clock size={16} />
                              <span>
                                {startDate && format(startDate, 'hh:mm aa')} -{' '}
                                {event.name}
                              </span>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Link to={`/${team?.id}`}>{team?.name}</Link>
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
