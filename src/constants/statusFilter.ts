export const STOP_POLL_STATUSES = ['D', 'IE', 'CE', 'AB'];
export const NO_DETAIL_STATUSES = ['IE', 'CE', 'AB', 'AC', 'SC'];

export function shouldStopPolling(status: string) {
  return STOP_POLL_STATUSES.includes(status);
}
export function isNoTestcaseStatus(status: string) {
  return NO_DETAIL_STATUSES.includes(status);
}
