import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { parseISO } from 'date-fns';
import { Fragment } from 'react';
import { GameTag } from '~/components/GameTag';
import { GoogleMapLink } from '~/components/GoogleMapLink';
import { searchDivisionLocations } from '~/libs/services/division-location-service';
import { isGameEvent, searchEvents } from '~/libs/services/event-service';
import {
  getTeam,
  searchTeams,
  searchTeamsByDivisionId,
} from '~/libs/services/team-service';
import type { TeamDTO } from '~/libs/services/types';
import { convertUTCDateStringToTimeZone } from '~/libs/utils/date-utils';

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
  const divisionLocationIds = events
    .map(({ division_location_id }) => division_location_id)
    .filter((num): num is number => num !== undefined);

  const divisionLocations = await searchDivisionLocations(teamSnapClientId, {
    ids: divisionLocationIds,
  });

  // search event's teams
  const teamIds = events
    .map(({ team_id }) => team_id)
    .filter((num): num is number => num !== undefined);

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
  return (
    <div className="container mx-auto px-4">
      <div className="px-4 sm:px-0">
        <h1 className="text-lg font-semibold leading-7 text-gray-900">
          {data.team === 'all' ? (
            <>All Teams Events</>
          ) : (
            <>{(data.team as TeamDTO).name} Team Events</>
          )}
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Upcoming of hockey events
        </p>
      </div>
      <div className="my-6 border-t border-gray-100"></div>
      {data.events.map((event) => {
        const startDate = event.start_date
          ? event.time_zone_iana_name
            ? convertUTCDateStringToTimeZone(
                event.start_date,
                event.time_zone_iana_name
              )
            : parseISO(event.start_date)
          : undefined;
        const divisionLocation = data.divisionLocations.find(
          ({ id }) => id === event.division_location_id
        );
        const team = data.teams.find(({ id }) => id === event.team_id);

        return (
          <Fragment key={event.id}>
            <div className="flex flex-col w-full border rounded-none md:flex-row">
              <div className="flex flex-row p-4 font-bold leading-none text-gray-800 uppercase bg-gray-400 md:flex-col md:items-center md:justify-center md: w-2/12">
                <div className="md:text-xl">
                  {startDate?.toLocaleString('en-CA', {
                    weekday: 'long',
                  })}
                </div>
                <div className="md:text-sm">
                  {startDate?.toLocaleString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="md:text-xs">
                  {startDate?.toLocaleString('en-CA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className="p-4 font-normal text-sm text-gray-800 md:w-3/4">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  {event.name} {isGameEvent(event) && <GameTag />}
                </h2>
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
                        <GoogleMapLink address={divisionLocation.address} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
