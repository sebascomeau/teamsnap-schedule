import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';

export interface Data {
  name: string;
  value: string;
  type: string;
}

export interface Response {
  collection: {
    items: Array<{
      data: Array<Data>;
    }>;
  };
}

export interface EventsResponse extends Response {}
export interface DivisionLocationsResponse extends Response {}

export const tryGetDataValue = <T,>(data: Data[], name: string) =>
  data.find((data) => data.name === name)?.value as T | undefined;

export const toEventDTO = (data: Data[]) => {
  const dto = {
    id: tryGetDataValue<number>(data, 'id'),
    division_location_id: tryGetDataValue<number>(data, 'division_location_id'),
    is_canceled: tryGetDataValue<boolean>(data, 'is_canceled'),
    is_game: tryGetDataValue<boolean>(data, 'is_game'),
    is_tbd: tryGetDataValue<boolean>(data, 'is_tbd'),
    location_id: tryGetDataValue<number>(data, 'location_id'),
    name: tryGetDataValue<string>(data, 'name'),
    opponent_id: tryGetDataValue<number>(data, 'opponent_id'),
    points_for_opponent: tryGetDataValue<number>(data, 'points_for_opponent'),
    points_for_team: tryGetDataValue<number>(data, 'points_for_team'),
    start_date: tryGetDataValue<string>(data, 'start_date'),
    team_id: tryGetDataValue<number>(data, 'team_id'),
    time_zone_iana_name: tryGetDataValue<string>(data, 'time_zone_iana_name'),
  };
  return dto as typeof dto & Record<string, string>;
};

export const toDivisionLocationDTO = (data: Data[]) => {
  const dto = {
    id: tryGetDataValue<number>(data, 'id'),
    type: tryGetDataValue<string>(data, 'type'),
    address: tryGetDataValue<string>(data, 'address'),
    name: tryGetDataValue<string>(data, 'name'),
    notes: tryGetDataValue<string>(data, 'notes'),
    phone: tryGetDataValue<string>(data, 'phone'),
    division_id: tryGetDataValue<number>(data, 'division_id'),
    url: tryGetDataValue<string>(data, 'url'),
  };
  return dto as typeof dto & Record<string, string>;
};

export const toTeamDTO = (data: Data[]) => {
  const dto = {
    id: tryGetDataValue<number>(data, 'id'),
    division_name: tryGetDataValue<string>(data, 'division_name'),
    division_id: tryGetDataValue<number>(data, 'division_id'),
    is_retired: tryGetDataValue<boolean>(data, 'is_retired'),
    name: tryGetDataValue<string>(data, 'name'),
    season_name: tryGetDataValue<string>(data, 'season_name'),
    time_zone_iana_name: tryGetDataValue<number>(data, 'time_zone_iana_name'),
  };
  return dto as typeof dto & Record<string, string>;
};

var date = new Date();
date.setDate(date.getDate() - 1); // yesterday

export const loader = async () => {
  const eventResponse = await fetch(
    'https://api.teamsnap.com/v3/events/search?team_id=9019049&started_after=' +
      date.toISOString(),
    {
      headers: [
        [
          'X-Teamsnap-Client-Id',
          '810cc0ce89d537027e0b7e94634ac83d38ca55484f5d3d214ef791552214626e',
        ],
        ['Accept', 'application/vnd.collection+json'],
      ],
    }
  );

  const events = (await eventResponse.json()) as EventsResponse;
  const eventDTOs = events.collection.items.map(({ data }) => toEventDTO(data));

  const divisionLocationsResponse = await fetch(
    'https://api.teamsnap.com/v3/division_locations/search?id=' +
      eventDTOs
        .map(({ division_location_id }) => division_location_id)
        .filter((elm) => (elm ? true : false))
        .join(','),
    {
      headers: [
        [
          'X-Teamsnap-Client-Id',
          '810cc0ce89d537027e0b7e94634ac83d38ca55484f5d3d214ef791552214626e',
        ],
        ['Accept', 'application/vnd.collection+json'],
      ],
    }
  );

  const divisionLocations =
    (await divisionLocationsResponse.json()) as DivisionLocationsResponse;
  const divisionLocationDTOs = divisionLocations.collection.items.map(
    ({ data }) => toDivisionLocationDTO(data)
  );

  const teamsResponse = await fetch(
    'https://api.teamsnap.com/v3/teams/search?id=' +
      eventDTOs
        .map(({ team_id }) => team_id)
        .filter((elm) => (elm ? true : false))
        .join(','),
    {
      headers: [
        [
          'X-Teamsnap-Client-Id',
          '810cc0ce89d537027e0b7e94634ac83d38ca55484f5d3d214ef791552214626e',
        ],
        ['Accept', 'application/vnd.collection+json'],
      ],
    }
  );

  const teams = (await teamsResponse.json()) as DivisionLocationsResponse;
  const teamDTOs = teams.collection.items.map(({ data }) =>
    toDivisionLocationDTO(data)
  );

  return json({
    events: eventDTOs,
    divisionLocations: divisionLocationDTOs,
    teams: teamDTOs,
  });
};

export default function Events() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="container">
      <div className="px-4 sm:px-0">
        <h1 className="text-lg font-semibold leading-7 text-gray-900">
          Events
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Upcoming of hockey events for:{' '}
          <strong>{data.teams.map(({ name }) => name).join(', ')}</strong>
        </p>
      </div>
      <div className="my-6 border-t border-gray-100"></div>
      {data.events.map((event) => {
        const startDate = event.start_date
          ? new Date(event.start_date)
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
                  {startDate?.toLocaleString('default', {
                    weekday: 'long',
                    timeZone: event.time_zone_iana_name ?? undefined,
                  })}
                </div>
                <div className="md:text-sm">
                  {startDate?.toLocaleString('default', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: event.time_zone_iana_name ?? undefined,
                  })}
                </div>
                <div className="md:text-xs">
                  {startDate?.toLocaleString('default', {
                    hour: '2-digit',
                    timeZone: event.time_zone_iana_name ?? undefined,
                  })}
                </div>
              </div>
              <div className="p-4 font-normal text-sm text-gray-800 md:w-3/4">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  {event.name}
                </h2>
                <p>{team?.name}</p>
                {divisionLocation && (
                  <div className="mt-4 text-gray-700">
                    <strong>{divisionLocation.name}</strong>
                    <br />
                    {divisionLocation.address}
                  </div>
                )}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
