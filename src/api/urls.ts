const TEST_CONNECTION_URL = `${process.env.REACT_APP_DEV_BACKEND_URL}:${process.env.REACT_APP_DEV_BACKEND_PORT}/api/`;
const PROD_CONNECTION_URL = `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/`;

export const getConnectionUrl = (): string => {
  const test_env = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
  if (test_env) return TEST_CONNECTION_URL;
  return PROD_CONNECTION_URL;
};
export const getAdminPageUrl = (): string => {
  return `${getConnectionUrl()}admin/`;
};

export { TEST_CONNECTION_URL, PROD_CONNECTION_URL };
