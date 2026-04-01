import type {
  RenderItemProps,
  TimelineItem,
  ViewMode,
} from "../../types/timeline.types";
import { getTwoRowHeader } from "../../utils/dateUtils";
import { itemToStyle, pixelToDate } from "../../utils/positionUtils";
import { WorkItem } from "./WorkItem";

interface TrackRowProps<TData = unknown> {
  trackId: string;
  items: TimelineItem<TData>[];
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  dayWidth: number;
  view: ViewMode;
  selectedItemId: string | null;
  hoveredItemId: string | null;
  renderItem?: (props: RenderItemProps<TData>) => React.ReactNode;
  onItemClick: (item: TimelineItem<TData>) => void;
  onItemHover: (item: TimelineItem<TData> | null) => void;
  onTrackClick: (trackId: string, date: Date) => void;
}

export function TrackRow<TData = unknown>({
  trackId,
  items,
  startDate,
  endDate,
  totalWidth,
  dayWidth,
  view,
  selectedItemId,
  hoveredItemId,
  renderItem,
  onItemClick,
  onItemHover,
  onTrackClick,
}: TrackRowProps<TData>) {
  const header = getTwoRowHeader(startDate, endDate, view, dayWidth);

  // Pre-compute stable left offsets before render — avoids mutation during JSX evaluation
  const gridLineOffsets = header.bottomRow.reduce<number[]>((acc) => {
    acc.push(
      acc.length === 0
        ? 0
        : acc[acc.length - 1] + header.bottomRow[acc.length - 1].widthPx,
    );
    return acc;
  }, []);

  return (
    <div
      className="relative border-b border-gray-100"
      style={{ width: totalWidth, minHeight: 48 }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onTrackClick(
          trackId,
          pixelToDate(e.clientX - rect.left, startDate, dayWidth),
        );
      }}
    >
      {/* Vertical grid lines aligned to bottom-row calendar units */}
      {header.bottomRow.map((_unit, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gray-100"
          style={{ left: gridLineOffsets[i] }}
        />
      ))}

      {items.map((item) => {
        const { left, width } = itemToStyle(
          item as TimelineItem<unknown>,
          startDate,
          dayWidth,
        );
        return (
          <WorkItem
            key={item.id}
            item={item}
            left={left}
            width={width}
            isSelected={selectedItemId === item.id}
            isHovered={hoveredItemId === item.id}
            renderItem={renderItem}
            onClick={onItemClick}
            onMouseEnter={onItemHover}
            onMouseLeave={() => onItemHover(null)}
          />
        );
      })}
    </div>
  );
}
