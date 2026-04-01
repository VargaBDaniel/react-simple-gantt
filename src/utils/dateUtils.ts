import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
} from "date-fns";
import type {
  CalendarHeader,
  CalendarUnit,
  ViewMode,
} from "../types/timeline.types";

/**
 * Returns the number of days covered by one bottom-row unit for a given view.
 * Used to compute the pixel width of each top-row header cell.
 */
function daysInUnit(date: Date, view: ViewMode): number {
  switch (view) {
    case "day":
      return 1;
    case "week":
      return 7;
    case "month":
      return differenceInCalendarDays(endOfMonth(date), startOfMonth(date)) + 1;
  }
}

/**
 * Builds the two-row calendar header for a given date range and view.
 *
 * - day view:   top = months, bottom = days
 * - week view:  top = months, bottom = week-start dates (Mon)
 * - month view: top = years,  bottom = months
 */
export function getTwoRowHeader(
  startDate: Date,
  endDate: Date,
  view: ViewMode,
  dayWidth: number,
): CalendarHeader {
  switch (view) {
    case "day": {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const bottomRow: CalendarUnit[] = days.map((d) => ({
        date: d,
        label: format(d, "d"),
        widthPx: dayWidth,
      }));

      // Top row: one cell per month spanning the days in that month within [startDate, endDate]
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      const topRow: CalendarUnit[] = months.map((monthStart) => {
        const clampedStart = monthStart < startDate ? startDate : monthStart;
        const monthEnd = endOfMonth(monthStart);
        const clampedEnd = monthEnd > endDate ? endDate : monthEnd;
        const count = differenceInCalendarDays(clampedEnd, clampedStart) + 1;
        return {
          date: clampedStart,
          label: format(monthStart, "MMMM yyyy"),
          widthPx: count * dayWidth,
        };
      });

      return { topRow, bottomRow };
    }

    case "week": {
      const weekStarts = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 },
      );
      const bottomRow: CalendarUnit[] = weekStarts.map((ws) => {
        // Clamp to [startDate, endDate]
        const clampedStart = ws < startDate ? startDate : ws;
        const weekEnd = addDays(ws, 6);
        const clampedEnd = weekEnd > endDate ? endDate : weekEnd;
        const count = differenceInCalendarDays(clampedEnd, clampedStart) + 1;
        return {
          date: ws,
          label: format(ws, "MMM d"),
          widthPx: count * dayWidth,
        };
      });

      // Top row: months
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      const topRow: CalendarUnit[] = months.map((monthStart) => {
        const clampedStart = monthStart < startDate ? startDate : monthStart;
        const monthEnd = endOfMonth(monthStart);
        const clampedEnd = monthEnd > endDate ? endDate : monthEnd;
        const count = differenceInCalendarDays(clampedEnd, clampedStart) + 1;
        return {
          date: clampedStart,
          label: format(monthStart, "MMMM yyyy"),
          widthPx: count * dayWidth,
        };
      });

      return { topRow, bottomRow };
    }

    case "month": {
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      const bottomRow: CalendarUnit[] = months.map((m) => {
        const days = daysInUnit(m, "month");
        return {
          date: m,
          label: format(m, "MMM"),
          widthPx: days * dayWidth,
        };
      });

      // Top row: years
      const yearStarts = Array.from(
        new Set(months.map((m) => m.getFullYear())),
      ).map((y) => new Date(y, 0, 1));

      const topRow: CalendarUnit[] = yearStarts.map((yearStart) => {
        const yearMonths = months.filter(
          (m) => m.getFullYear() === yearStart.getFullYear(),
        );
        const totalDays = yearMonths.reduce(
          (sum, m) => sum + daysInUnit(m, "month"),
          0,
        );
        return {
          date: yearStart,
          label: format(yearStart, "yyyy"),
          widthPx: totalDays * dayWidth,
        };
      });

      return { topRow, bottomRow };
    }
  }
}

/**
 * Returns the next tick boundary date after `date` for the given view,
 * used to draw vertical grid lines.
 */
export function getNextTick(date: Date, view: ViewMode): Date {
  switch (view) {
    case "day":
      return addDays(date, 1);
    case "week":
      return addWeeks(endOfWeek(date, { weekStartsOn: 1 }), 0);
    case "month":
      return addMonths(startOfMonth(date), 1);
  }
}
