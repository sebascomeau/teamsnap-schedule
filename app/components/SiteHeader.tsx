import { Link } from '@remix-run/react';
import type { NavProps } from './Nav';
import { Nav } from './Nav';

export interface SiteHeaderProps {
  navProps?: NavProps;
}

export const SiteHeader = ({ navProps }: SiteHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center space-x-4 justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img
            alt=""
            src="https://bathurstminorhockey.teamsnapsites.com/wp-content/uploads/sites/415/2023/08/Hockey-mineur-_SSa-R06b_Mil-1-3.png"
            className="w-10 h-10"
            height={40}
            width={40}
          />
          <span className="font-bold">Bathurst Hockey</span>
        </Link>
        <Nav {...navProps} />
      </div>
    </header>
  );
};
