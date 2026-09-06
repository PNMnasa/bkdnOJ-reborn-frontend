function isDev(): boolean {
  if (process.env.NODE_ENV === "production" || process.env.REACT_APP_ENV === "STAGING") {
    return false;
  }
  return true;
}

const dev = isDev();

export function log(msg: unknown) {
  if (dev) console.log(msg);
}
export function error(msg: unknown) {
  if (dev) console.error(msg);
}
export function warn(msg: unknown) {
  if (dev) console.warn(msg);
}
