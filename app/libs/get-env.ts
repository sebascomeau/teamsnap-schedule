export const isBrowser = () => {
  return typeof window !== 'undefined';
};

type WindowWithENV = Window &
  typeof globalThis & { ENV: Record<string, string> };

export const getEnv = () => {
  return isBrowser() ? (window as WindowWithENV).ENV : process.env;
};
