import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { addDays, format, parse } from 'date-fns';
import { Fragment } from 'react';
import { GameTag } from '~/components/GameTag';
import { GoogleMapLink } from '~/components/GoogleMapLink';
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

  // undefined means all teams
  const teamId = params.teamId
    ? Number.parseInt(params.teamId as string)
    : teamAll;

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
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold">
          {data.team === 'all' ? (
            <>All Teams Events</>
          ) : (
            <>Team Events - {(data.team as TeamDTO).name}</>
          )}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground sm:text-xl text-gray-500">
          Upcoming of team events
        </p>
      </div>
      <div className="my-6 border-t border-gray-100"></div>
      {Object.entries(eventsByWeek).map(([weekStart, eventsByDay]) => {
        const startDate = new Date(weekStart);
        const endDate = addDays(startDate, 6);

        return (
          <div key={'week-' + weekStart}>
            <h2>
              Week {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}
            </h2>
            {Object.entries(eventsByDay).map(([day, events]) => (
              <div key={day}>
                <h3>
                  {format(
                    parse(day, 'yyyy-mm-dd', new Date()),
                    'iiii, MMMM do'
                  )}
                </h3>
                <ul>
                  {events.map((event, index) => {
                    const startDate = convertEventStartDate(event);
                    const team = data.teams.find(
                      ({ id }) => id === event.team_id
                    );
                    const divisionLocation = data.divisionLocations.find(
                      ({ id }) => id === event.division_location_id
                    );
                    return (
                      <div
                        key={event.id}
                        className="flex flex-col w-full border rounded-none md:flex-row"
                      >
                        <div className="p-4 font-normal text-sm text-gray-800 md:w-3/4">
                          <h3 className="text-base font-semibold leading-7 text-gray-900">
                            {startDate && format(startDate, 'hh:mm aaa')} -{' '}
                            {event.name} {isGameEvent(event) && <GameTag />}
                          </h3>
                          <p>{team?.name}</p>
                          {divisionLocation && (
                            <>
                              <p className="mt-4 text-gray-700">
                                <strong>{divisionLocation.name}</strong>
                                {divisionLocation.address && (
                                  <>
                                    <br />
                                    {divisionLocation.address}
                                  </>
                                )}
                              </p>
                              {divisionLocation.address && (
                                <div className="mt-2">
                                  <GoogleMapLink
                                    address={divisionLocation.address}
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
