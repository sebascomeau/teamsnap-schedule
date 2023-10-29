import { parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

/**
 * Convert a UTC date string to a specific timezone.
 * @param {string} utcDateString - The UTC date string to convert.
 * @param {string} targetTimeZone - The target timezone (e.g., 'America/New_York').
 * @returns {Date} - The converted date in the specified timezone.
 */
export const convertUTCDateStringToTimeZone = (
  utcDateString: string,
  targetTimeZone: string
): Date => {
  const utcDate = parseISO(utcDateString);
  const dateInTimeZone = utcToZonedTime(utcDate, targetTimeZone);
  return dateInTimeZone;
};
