import { redirect, type LoaderFunction } from "@remix-run/node";
import { getYear } from "date-fns";

export const loader: LoaderFunction = async () => {
  const currentYear: number = getYear(new Date());
  return redirect(`/events/${currentYear}`);
};

export type Loader = typeof loader;
