export interface Data {
  name: string;
  value: string;
  type: string;
}

export const tryGetDataValue = <T>(data: Data[], name: string) =>
  data.find((data) => data.name === name)?.value as T | undefined;
