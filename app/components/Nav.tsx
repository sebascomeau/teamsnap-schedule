import * as React from "react";
import { Menu } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import type { LinkProps } from "@remix-run/react";
import { Link } from "@remix-run/react";

export interface NavItem {
  items?: ReadonlyArray<NavLinkItem>;
  title: string;
}

export interface NavLinkItem {
  disabled?: boolean;
  href: string;
  title: string;
}

export interface NavProps {
  items?: ReadonlyArray<NavItem>;
}

export const Nav = ({ items }: NavProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <NavLink
          to="/"
          className="flex space-x-2 items-center"
          onOpenChange={setOpen}
        >
          <img
            alt=""
            src="https://bathurstminorhockey.teamsnapsites.com/wp-content/uploads/sites/415/2023/08/Hockey-mineur-_SSa-R06b_Mil-1-3.png"
            className="w-10 h-10"
            height={40}
            width={40}
          />
          <span className="font-bold">Bathurst Hockey</span>
        </NavLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-2">
            {items?.map((item, index) => (
              <div key={index} className="flex flex-col space-y-3 pt-6">
                <h4 className="font-medium">{item.title}</h4>
                {(item.items?.length ?? 0) > 0 &&
                  item.items?.map((item) => (
                    <React.Fragment key={item.href}>
                      {!item.disabled &&
                        (item.href ? (
                          <NavLink
                            to={item.href}
                            onOpenChange={setOpen}
                            className="text-muted-foreground"
                          >
                            {item.title}
                          </NavLink>
                        ) : (
                          item.title
                        ))}
                    </React.Fragment>
                  ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export interface NavLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const NavLink = ({
  to,
  onOpenChange,
  className,
  children,
  ...props
}: NavLinkProps) => {
  return (
    <Link
      to={to}
      onClick={() => {
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
};
