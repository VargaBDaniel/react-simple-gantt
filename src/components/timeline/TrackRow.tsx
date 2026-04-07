import { useState } from "react";
import type {
  RenderItemProps,
  TimelineItem,
  ViewMode,
} from "../../types/timeline.types";
import { getTwoRowHeader } from "../../utils/dateUtils";
import { itemToStyle, pixelToDate } from "../../utils/positionUtils";
import { ITEM_BAR_H, LANE_H, computeLanes } from "../../utils/staggerUtils";
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
  renderTrackIndicator?: (date: Date) => React.ReactNode;
  itemStagger?: number;
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
  renderTrackIndicator,
  itemStagger = 0,
}: TrackRowProps<TData>) {
  const [indicatorX, setIndicatorX] = useState<number | null>(null);

  // Lane layout — only computed when stagger is active.
  const lanes = itemStagger > 0 ? computeLanes(items) : null;
  const numLanes = lanes ? Math.max(...lanes) + 1 : 1;

  // Row height grows with the number of staggered lanes.
  // At itemStagger=0 the row uses minHeight so content rows stay compact.
  const rowHeight = LANE_H + (numLanes - 1) * ITEM_BAR_H * itemStagger;
  const rowStyle: React.CSSProperties =
    itemStagger > 0
      ? { width: totalWidth, height: rowHeight }
      : { width: totalWidth, minHeight: LANE_H };

  const header = getTwoRowHeader(startDate, endDate, view, dayWidth);

  // Left offsets for vertical grid lines, one per bottom-row calendar unit.
  const gridLineLeftOffsets = header.bottomRow.map((_, i) =>
    header.bottomRow.slice(0, i).reduce((sum, u) => sum + u.widthPx, 0),
  );

  function getItemTop(lane: number): number {
    // Centre the bar vertically within its lane slot.
    return lane * ITEM_BAR_H * itemStagger + (LANE_H - ITEM_BAR_H) / 2;
  }

  return (
    <div
      className="relative overflow-hidden border-b border-gray-100"
      style={rowStyle}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onTrackClick(
          trackId,
          pixelToDate(e.clientX - rect.left, startDate, dayWidth),
        );
      }}
      onMouseMove={
        renderTrackIndicator
          ? (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setIndicatorX(e.clientX - rect.left);
            }
          : undefined
      }
      onMouseLeave={
        renderTrackIndicator ? () => setIndicatorX(null) : undefined
      }
    >
      {/* Vertical grid lines */}
      {gridLineLeftOffsets.map((left, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gray-100"
          style={{ left }}
        />
      ))}

      {/* Work items */}
      {items.map((item, idx) => {
        const { left, width } = itemToStyle(item, startDate, dayWidth);
        const lane = lanes?.[idx] ?? 0;
        const top = itemStagger > 0 ? getItemTop(lane) : undefined;

        return (
          <WorkItem
            key={item.id}
            item={item}
            left={left}
            width={width}
            top={top}
            itemH={itemStagger > 0 ? ITEM_BAR_H : undefined}
            isSelected={selectedItemId === item.id}
            isHovered={hoveredItemId === item.id}
            renderItem={renderItem}
            onClick={onItemClick}
            onMouseEnter={onItemHover}
            onMouseLeave={() => onItemHover(null)}
          />
        );
      })}

      {/* Hover indicator */}
      {renderTrackIndicator && indicatorX !== null && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-3"
          style={{ left: indicatorX }}
        >
          {renderTrackIndicator(pixelToDate(indicatorX, startDate, dayWidth))}
        </div>
      )}
    </div>
  );
}
