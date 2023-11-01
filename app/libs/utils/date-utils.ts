import { parse, parseISO } from "date-fns";

import { utcToZonedTime } from "date-fns-tz";

/**
 * Convert a UTC date string to a specific timezone.
 * @param utcDateString - The UTC date string to convert.
 * @param targetTimeZone - The target timezone (e.g., 'America/New_York').
 * @returns The converted date in the specified timezone.
 */
export const convertUTCDateStringToTimeZone = (
  utcDateString: string,
  targetTimeZone: string,
) => {
  const utcDate = parseISO(utcDateString);
  const dateInTimeZone = utcToZonedTime(utcDate, targetTimeZone);
  return dateInTimeZone;
};

/**
 * Parses a date string in the format "yyyy-mm-dd" and returns a Date object using date-fns.
 * @param dateString - The date string in "yyyy-mm-dd" format.
 * @returns A Date object representing the parsed date, or null if the parsing fails.
 */
export const parseDateStringToDate = (dateString: string) => {
  const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());

  if (isNaN(parsedDate.getTime())) {
    // If parsing fails, return null.
    return null;
  }

  return parsedDate;
};
