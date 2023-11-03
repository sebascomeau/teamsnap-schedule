import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  return redirect("/events");
};

export type Loader = typeof loader;
