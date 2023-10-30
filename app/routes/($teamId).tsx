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
import { searchDivisionLocations } from '~/libs/services/division-location-service';
import {
  convertEventStartDate,
  groupEventsByWeek,
  isGameEvent,
  searchEvents,
} from '~/libs/services/event-service';
import {
  getTeam,
  searchTeams,
  searchTeamsByDivisionId,
} from '~/libs/services/team-service';
import type { TeamDTO } from '~/libs/services/types';
import { parseDateStringToDate } from '~/libs/utils/date-utils';
import { removeNullOrUndefined } from '~/libs/utils/misc-utils';

const divisionId = 760038;
const teamAll = 'all';

const getQueryTeamIds = async (
  teamSnapClientId: string,
  teamId: typeof teamAll | number
) => {
  return teamId === teamAll
    ? (await searchTeamsByDivisionId(teamSnapClientId, divisionId)).map(
        ({ id }) => id
      )
    : [teamId];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const teamSnapClientId = process.env.TEAMSNAP_CLIENT_ID ?? '';

  console.log('bob');

  // undefined means all teams
  const teamId = params.teamId ? Number.parseInt(params.teamId) : teamAll;

  const currentTeam =
    teamId === teamAll
      ? teamAll
      : isNaN(teamId)
      ? null
      : await getTeam(teamSnapClientId, teamId);

  if (currentTeam === null) {
    // not found
    throw new Response('Team Not Found', { status: 404 });
  }

  // Get today's date
  const today = new Date();

  // Set the time to zero (midnight)
  today.setHours(0, 0, 0, 0);

  const events = await searchEvents(teamSnapClientId, {
    teamIds: await getQueryTeamIds(teamSnapClientId, teamId),
    startedAfter: today,
  });

  // search event's division locations
  const divisionLocationIds = removeNullOrUndefined(
    events.map(({ division_location_id }) => division_location_id)
  );
  const divisionLocations = await searchDivisionLocations(teamSnapClientId, {
    ids: divisionLocationIds,
  });

  // search event's teams
  const teamIds = removeNullOrUndefined(events.map(({ team_id }) => team_id));
  const teams = await searchTeams(teamSnapClientId, { ids: teamIds });

  return json({
    divisionLocations,
    events,
    team: currentTeam,
    teams,
  });
};

export default function Events() {
  const data = useLoaderData<typeof loader>();
  const eventsByWeek = groupEventsByWeek(data.events);

  return (
    <div className="container mx-auto px-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {data.team === 'all' ? (
          <>All Teams Events</>
        ) : (
          <>Team Events - {(data.team as TeamDTO).name}</>
        )}
      </h1>
      <p className="text-lg text-muted-foreground">Upcoming of team events</p>

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
    </div>
  );
}
