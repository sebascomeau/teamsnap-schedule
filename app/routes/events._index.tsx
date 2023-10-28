import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';

export interface EventData {
  name: string;
  value: string;
  type: string;
}

export type Events = {
  collection: {
    items: Array<{
      href: string;
      links: Array<{
        rel: string;
        href: string;
        deprecated?: boolean;
        prompt?: string;
      }>;
      data: Array<EventData>;
    }>;
  };
};

export const loader = async () => {
  const response = await fetch(
    'https://api.teamsnap.com/v3/events/search?team_id=9019049',
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
  return json((await response.json()) as Events);
};

export const getEventDataItem = <T,>(eventData: EventData[], name: string) =>
  eventData.find((data) => data.name === name)?.value as T | undefined | null;

export const toEventDTO = (
  eventData: EventData[]
): Record<string, string | boolean | number | undefined | null> => ({
  id: getEventDataItem<number>(eventData, 'id'),
  division_location_id: getEventDataItem(eventData, 'division_location_id'),
  is_canceled: getEventDataItem<boolean>(eventData, 'is_canceled'),
  is_game: getEventDataItem<boolean>(eventData, 'is_game'),
  is_tbd: getEventDataItem<boolean>(eventData, 'is_tbd'),
  location_id: getEventDataItem<number>(eventData, 'location_id'),
  name: getEventDataItem(eventData, 'name'),
  opponent_id: getEventDataItem<number>(eventData, 'opponent_id'),
  points_for_opponent: getEventDataItem<number>(
    eventData,
    'points_for_opponent'
  ),
  points_for_team: getEventDataItem<number>(eventData, 'points_for_team'),
  start_date: getEventDataItem(eventData, 'start_date'),
  team_id: getEventDataItem<number>(eventData, 'team_id'),
  time_zone_iana_name: getEventDataItem(eventData, 'time_zone_iana_name'),
});

export default function Events() {
  const events = useLoaderData<typeof loader>();
  console.dir(events);
  return (
    <>
      {events.collection.items.map(({ data }) => {
        const eventDTO = toEventDTO(data);
        return (
          <dl key={eventDTO.id} style={{ borderBottom: '1px solid red' }}>
            {Object.keys(eventDTO).map((key) => (
              <Fragment key={key}>
                <dd>{key}</dd>
                <dt>{eventDTO[key]}</dt>
              </Fragment>
            ))}
          </dl>
        );
      })}
    </>
  );
}
