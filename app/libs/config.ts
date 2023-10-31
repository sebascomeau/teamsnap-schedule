import { getEnv } from './get-env';

export const config = () => {
  const env = getEnv();
  return {
    TEAMSNAP_CLIENT_ID: env.TEAMSNAP_CLIENT_ID ?? '',
    TEAMSNAP_ROOT_DIVISION_ID: env.TEAMSNAP_ROOT_DIVISION_ID
      ? parseInt(env.TEAMSNAP_ROOT_DIVISION_ID)
      : -1,
  };
};
