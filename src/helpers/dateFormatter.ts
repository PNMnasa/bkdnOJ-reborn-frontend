/* eslint-disable no-unused-vars */
function getWeekDayShort(dateobj: Date): string {
  return dateobj.toLocaleDateString("en-US", { weekday: "short" });
}
function getWeekDayLong(dateobj: Date): string {
  return dateobj.toLocaleDateString("en-US", { weekday: "long" });
}
function getMonthShort(dateobj: Date): string {
  return dateobj.toLocaleDateString("en-US", { month: "short" });
}
function getDaySuffix(num: number): string {
  if (9 < num < 19) return "th";
  if (num % 10 === 1) return "st";
  if (num % 10 === 2) return "nd";
  if (num % 10 === 3) return "rd";
  return "th";
}
export function getYearMonthDate(date?: string | number | Date | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (!isFinite(d.getTime())) return "N/A";

  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  return (
    d.getFullYear() +
    "/" +
    (mm < 10 ? "0" : "") +
    mm +
    "/" +
    (dd < 10 ? "0" : "") +
    dd
  );
}
export function getHourMinuteSecond(date?: string | number | Date | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (!isFinite(d.getTime())) return "N/A";

  return (
    ("0" + d.getHours()).slice(-2) +
    ":" +
    ("0" + d.getMinutes()).slice(-2) +
    ":" +
    ("0" + d.getSeconds()).slice(-2)
  );
}

export function getLocalDateWithTimezone(date?: string | number | Date | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (!isFinite(d.getTime())) return "N/A";

  const datelen = String(date).length;
  return d.toLocaleString() + ` (${String(date).substring(datelen - 6)})`;
}

export default function dateFormatter(date?: string | number | Date | null, short = false): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (!isFinite(d.getTime())) return "N/A";
  const now = new Date();

  let timeString =
    ("0" + d.getHours()).slice(-2) +
    ":" +
    ("0" + d.getMinutes()).slice(-2) +
    ":" +
    ("0" + d.getSeconds()).slice(-2);

  let dateString =
    d.getFullYear() +
    "/" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "/" +
    ("0" + d.getDate()).slice(-2) +
    " " +
    timeString;

  return dateString;
}
