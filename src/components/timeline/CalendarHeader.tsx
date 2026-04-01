import type { ViewMode } from "../../types/timeline.types";
import { getTwoRowHeader } from "../../utils/dateUtils";

interface CalendarHeaderProps {
  startDate: Date;
  endDate: Date;
  view: ViewMode;
  dayWidth: number;
  totalWidth: number;
}

export function CalendarHeader({
  startDate,
  endDate,
  view,
  dayWidth,
  totalWidth,
}: CalendarHeaderProps) {
  const { topRow, bottomRow } = getTwoRowHeader(
    startDate,
    endDate,
    view,
    dayWidth,
  );

  return (
    <div
      className="border-b border-gray-200 bg-white"
      style={{ width: totalWidth }}
    >
      {/* Top row: larger unit (month or year) */}
      <div className="flex border-b border-gray-100">
        {topRow.map((unit, i) => (
          <div
            key={i}
            className="shrink-0 px-2 py-1 text-xs font-semibold text-gray-500 border-r border-gray-100 overflow-hidden"
            style={{ width: unit.widthPx }}
          >
            <span className="truncate block">{unit.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom row: smaller unit (day, week-start, or month) */}
      <div className="flex">
        {bottomRow.map((unit, i) => (
          <div
            key={i}
            className="shrink-0 px-1 py-0.5 text-xs text-gray-400 border-r border-gray-100 text-center overflow-hidden"
            style={{ width: unit.widthPx }}
          >
            <span className="truncate block">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
