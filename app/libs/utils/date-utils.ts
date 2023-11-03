import {
  addWeeks,
  endOfDay,
  endOfWeek,
  getISOWeek,
  getYear,
  isValid,
  parse,
  parseISO,
  setISOWeek,
  startOfDay,
  startOfISOWeek,
  startOfWeek,
  startOfYear,
} from "date-fns";

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

/**
 * Checks if a given number is a valid year within a specified range.
 * @param year - The number to validate as a year.
 * @returns A boolean indicating whether the input is a valid year.
 */
export const isValidYear = (year: number) => {
  if (year < 1000 || year > 9999) {
    return false; // Outside the acceptable year range
  }

  // Create a test date by parsing the year along with a known month and day
  const testDate = parse(`${year}-01-01`, "yyyy-MM-dd", new Date());

  // Check if the parsed date is valid and the year matches the input
  return isValid(testDate) && getYear(testDate) === year;
};

/**
 * Gets the current week number within a specific year.
 * @param year - The specific year for which to retrieve the current week.
 * @returns The current week number within the specified year.
 */
export const getCurrentWeekInYear = (year: number) => {
  // Get the start of the specified year
  const startOfGivenYear = startOfYear(new Date(year, 0, 1));

  // Get the current date and find the number of weeks from the start of the year
  const currentDate = new Date();
  const weeksFromStartOfYear = getISOWeek(addWeeks(startOfGivenYear, 0));

  // Calculate the current week by subtracting the week number of the year start from the current week number
  const currentWeek =
    getISOWeek(addWeeks(startOfGivenYear, 0)) +
    getISOWeek(currentDate) -
    weeksFromStartOfYear;

  return currentWeek;
};

/**
 * Checks if a year and week combination can be used to create a valid date in the ISO week date system.
 * @param year - The year to validate.
 * @param week - The week to validate.
 * @returns A boolean indicating if the year and week together can form a valid date.
 */
export const isValidYearAndWeek = (year: number, week: number) => {
  const minWeek = 1;
  const maxWeek = 53;

  if (!isValidYear(year) || week < minWeek || week > maxWeek) {
    return false; // Year or week is outside the acceptable range
  }

  // Attempt to set the ISO week and check if the resulting date is valid
  const dateFromYearAndWeek = setISOWeek(
    startOfISOWeek(new Date(year, 0, 1)),
    week,
  );

  return isValid(dateFromYearAndWeek);
};

/**
 * Generates the start and end dates inclusively from a given year and week number.
 * @param year - The year for the week.
 * @param week - The week number within the year.
 * @returns An object with 'start' and 'end' properties representing the start and end dates of the week.
 */
export const getStartAndEndDateFromYearAndWeek = (
  year: number,
  week: number,
) => {
  if (!isValidYearAndWeek(year, week)) {
    return null; // Invalid year or week number
  }

  // Set the year and week to get the start of the week
  const startDate = startOfWeek(setISOWeek(new Date(year, 0, 1), week), {
    weekStartsOn: 1,
  });
  const endDate = endOfWeek(setISOWeek(new Date(year, 0, 1), week), {
    weekStartsOn: 1,
  });

  // Adjust the time to the start and end of the days
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  return { start, end };
};
