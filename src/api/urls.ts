const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

const joinApiUrl = (host: string | undefined, port: string | undefined): string => {
  let base = host ? stripTrailingSlash(host) : "";
  if (/\/api$/i.test(base)) return `${base}/`;
  if (port && !/:\d+$/.test(base)) {
    base = `${base}:${port}`;
  }
  return `${base}/api/`;
};

const TEST_CONNECTION_URL = joinApiUrl(process.env.REACT_APP_DEV_BACKEND_URL, process.env.REACT_APP_DEV_BACKEND_PORT);
const PROD_CONNECTION_URL = joinApiUrl(process.env.REACT_APP_BACKEND_URL, process.env.REACT_APP_BACKEND_PORT);

export const getConnectionUrl = (): string => {
  const test_env = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
  if (test_env) return TEST_CONNECTION_URL;
  return PROD_CONNECTION_URL;
};
export const getAdminPageUrl = (): string => {
  return `${getConnectionUrl()}admin/`;
};

export { TEST_CONNECTION_URL, PROD_CONNECTION_URL };
