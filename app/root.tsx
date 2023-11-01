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
import { getRootDivisionTeams, isTeamAll } from './libs/services/team-service';
import type { NavItem } from './components/Nav';
import { useMemo } from 'react';
import { SiteHeader } from './components/SiteHeader';
import { config } from './libs/config';

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

const getBrowserEnvironment = () => {
  const env = process.env;

  return {
    TEAMSNAP_ROOT_DIVISION_ID: env.TEAMSNAP_ROOT_DIVISION_ID,
    TEAMSNAP_CLIENT_ID: env.TEAMSNAP_CLIENT_ID,
  };
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const appConfig = config();

  // get root division
  const rootDivision = await getRootDivision(
    appConfig.TEAMSNAP_CLIENT_ID,
    appConfig.TEAMSNAP_ROOT_DIVISION_ID
  );
  if (rootDivision === null) {
    throw new Response('Root Division Not Found', { status: 404 });
  }

  // get root division's division tree
  const rootDivisionTree = await getDivisionTree(
    appConfig.TEAMSNAP_CLIENT_ID,
    rootDivision.id
  );

  // get root division's team
  const rootDivisionTeams = await getRootDivisionTeams(
    appConfig.TEAMSNAP_CLIENT_ID,
    appConfig.TEAMSNAP_ROOT_DIVISION_ID
  );

  return json({
    ENV: getBrowserEnvironment(),
    rootDivisionTree,
    rootDivision,
    rootDivisionTeams,
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();

  const navItems = useMemo(() => {
    return data.rootDivisionTree.map<NavItem>(({ id, name }) => ({
      items: data.rootDivisionTeams
        .filter(({ division_id }) => division_id === id)
        .map((team) => ({
          href: isTeamAll(team) ? '/' : `/${team.id}`,
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
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
