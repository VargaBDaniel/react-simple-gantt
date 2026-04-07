import { addDays, differenceInCalendarDays } from "date-fns";
import type { TimelineItem } from "../types/timeline.types";

/**
 * Converts a date to a pixel offset from the left edge of the timeline grid.
 * Fractional days are included for sub-day precision.
 */
export function dateToPixel(
  date: Date,
  startDate: Date,
  dayWidth: number,
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = date.getTime() - startDate.getTime();
  return (diffMs / msPerDay) * dayWidth;
}

/**
 * Returns the CSS `left` and `width` values (in px) for a timeline item bar.
 */
export function itemToStyle(
  item: TimelineItem,
  startDate: Date,
  dayWidth: number,
): { left: number; width: number } {
  const left = dateToPixel(item.start, startDate, dayWidth);
  const widthDays = differenceInCalendarDays(item.end, item.start) + 1;
  const width = Math.max(widthDays * dayWidth, dayWidth / 2);
  return { left, width };
}

/**
 * Converts a pixel offset (from the left edge of the timeline grid) back to a Date.
 * Snaps to the start of the clicked day.
 */
export function pixelToDate(
  px: number,
  startDate: Date,
  dayWidth: number,
): Date {
  return addDays(startDate, Math.floor(px / dayWidth));
}

/**
 * Returns the total scrollable width of the timeline grid in pixels.
 */
export function getTotalWidth(
  startDate: Date,
  endDate: Date,
  dayWidth: number,
): number {
  const days = differenceInCalendarDays(endDate, startDate) + 1;
  return days * dayWidth;
}
