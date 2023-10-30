import { parseISO } from 'date-fns';

import { utcToZonedTime } from 'date-fns-tz';

/**
 * Convert a UTC date string to a specific timezone.
 * @param utcDateString - The UTC date string to convert.
 * @param targetTimeZone - The target timezone (e.g., 'America/New_York').
 * @returns The converted date in the specified timezone.
 */
export const convertUTCDateStringToTimeZone = (
  utcDateString: string,
  targetTimeZone: string
) => {
  const utcDate = parseISO(utcDateString);
  const dateInTimeZone = utcToZonedTime(utcDate, targetTimeZone);
  return dateInTimeZone;
};
