import { type LoaderFunction, json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import type { Loader as RootLoader } from "../root";
import { getConfig } from "~/libs/config";
import { DivisionService } from "~/libs/services/division-service";
import { TeamService } from "~/libs/services/team-service";

export const loader: LoaderFunction = async ({ params }) => {
  const config = getConfig();
  const divisionService = DivisionService({ config });
  const teamService = TeamService({ config, divisionService });

  const teamId = parseInt(params.teamId ?? "", 10);
  const team = isNaN(teamId) ? undefined : await teamService.getTeam(teamId);

  if (!team) {
    // not found
    throw json(`Team ${params.teamId} Not Found`, { status: 404 });
  }

  return json({
    team,
  });
};

export type Loader = typeof loader;

export default function Events() {
  const data = useLoaderData<Loader>();
  const rootRouteData = useRouteLoaderData<RootLoader>("root");

  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Team {data.team.name} Events
      </h1>
      <p className="text-lg text-muted-foreground">
        Upcoming events for the {rootRouteData?.rootDivision.season_name}{" "}
        season.
      </p>
      <Outlet />
    </>
  );
}
