/**
 * Removes null or undefined values from an array.
 * @param array - The array that may contain null or undefined values.
 * @returns An array with no null or undefined values.
 */
export function removeNullOrUndefined<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(
    (value): value is T => value !== null && value !== undefined
  );
}
