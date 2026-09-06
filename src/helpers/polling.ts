export function getPollDelay(): number {
  return Number(process.env.REACT_APP_POLL_DELAY) || 5000;
}
