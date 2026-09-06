export function getDuration(t1: Date | string | number, t2: Date | string | number): string {
  let st1: Date, st2: Date;
  if (t1 instanceof Date) st1 = t1;
  else st1 = new Date(t1);
  if (t2 instanceof Date) st2 = t2;
  else st2 = new Date(t2);
  const seconds = Math.floor((st2.getTime() - st1.getTime()) / 1000);
  return secondsToHHMMSS(seconds);
}
export function secondsToHHMMSS(seconds: number): string {
  let mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  let hh = Math.floor(mm / 60);
  mm %= 60;
  return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
}
