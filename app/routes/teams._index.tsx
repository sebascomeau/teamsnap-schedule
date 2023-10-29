import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';
import { getDivision, getDivisionTree } from '~/libs/services/division-service';
import { searchTeamsByDivisionId } from '~/libs/services/team-service';

export const loader = async () => {
  const teamSnapClientId = process.env.TEAMSNAP_CLIENT_ID ?? '';
  const divisionId = 760038;

  const division = await getDivision(teamSnapClientId, divisionId);
  const divisionTree = await getDivisionTree(teamSnapClientId, divisionId);
  const teams = await searchTeamsByDivisionId(teamSnapClientId, divisionId);

  return json({
    division,
    divisionTree,
    teams,
  });
};

export default function Events() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="container">
      <div className="px-4 sm:px-0">
        <h1 className="text-xl font-semibold leading-7 text-gray-900">
          Division - {data.division?.name}
        </h1>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Season: <strong>{data.division?.season_name}</strong>
        </p>
      </div>
      {data.divisionTree
        .filter((division) => division.parent_id === data.division?.id)
        .map((division) => (
          <Fragment key={division.id}>
            <h2 className="text-lg font-semibold leading-7 text-gray-900">
              {division.name}
            </h2>
            <ul className="list-disc list-inside">
              {data.teams
                .filter((team) => team.division_id === division.id)
                .map((team) => (
                  <li key={team.id}>
                    <Link to={`/teams/${team.id}`} relative="route">
                      {team.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </Fragment>
        ))}
    </div>
  );
}
