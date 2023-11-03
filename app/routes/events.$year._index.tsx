import { redirect, type LoaderFunction, json } from "@remix-run/node";
import { getCurrentWeekInYear, isValidYear } from "~/libs/utils/date-utils";

export const loader: LoaderFunction = async ({ params }) => {
  const year = parseInt(params.year ?? "", 10);

  if (!isValidYear(year)) {
    // not found
    throw json(`Events Year ${params.year} Not Found`, { status: 404 });
  }

  const week = getCurrentWeekInYear(year);

  return redirect(`/events/${year}/${week}`);
};

export type Loader = typeof loader;

export default function EventsYearRoute() {
  return null;
}
