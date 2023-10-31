import { cssBundleHref } from '@remix-run/css-bundle';
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';

import stylesheet from '~/tailwind.css';
import {
  getDivisionTree,
  getRootDivision,
} from './libs/services/division-service';
import { getRootDivisionTeams, getTeamAll } from './libs/services/team-service';
import type { NavItem } from './components/Nav';
import { useMemo } from 'react';
import { SiteHeader } from './components/SiteHeader';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
    crossOrigin: 'anonymous',
  },
];

const teamAll = getTeamAll();

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const teamSnapClientId = process.env.TEAMSNAP_CLIENT_ID ?? '';

  // get root division
  const rootDivision = await getRootDivision(teamSnapClientId);
  if (rootDivision === null) {
    throw new Response('Root Division Not Found', { status: 404 });
  }

  // get root division's division tree
  const rootDivisionTree = await getDivisionTree(
    teamSnapClientId,
    rootDivision.id
  );

  // get root division's team
  const rootDivisionTeams = await getRootDivisionTeams(teamSnapClientId);

  return json({
    rootDivisionTree,
    rootDivision,
    rootDivisionTeams,
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();

  const navItems = useMemo(() => {
    return data.rootDivisionTree.map<NavItem>(({ id, name }) => ({
      items:
        id === teamAll.division_id
          ? [
              {
                href: `/`,
                title: teamAll.name,
              },
            ]
          : data.rootDivisionTeams
              .filter(({ division_id }) => division_id === id)
              .map((team) => ({
                href: `/${team.id}`,
                title: team.name ?? team.id.toString(),
              })),
      title: name ?? id.toString(),
    }));
  }, [data.rootDivisionTeams, data.rootDivisionTree]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <SiteHeader navProps={{ items: navItems }} />
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
