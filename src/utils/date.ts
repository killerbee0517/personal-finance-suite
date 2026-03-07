import dayjs from "dayjs";

export const today = () => dayjs().format("YYYY-MM-DD");

export const daysBetween = (fromDate: string, toDate: string): number => {
  return dayjs(toDate).startOf("day").diff(dayjs(fromDate).startOf("day"), "day");
};

export const daysTo = (toDate: string): number => daysBetween(today(), toDate);

export const isInNextDays = (date: string, days: number): boolean => {
  const diff = daysTo(date);
  return diff >= 0 && diff <= days;
};
