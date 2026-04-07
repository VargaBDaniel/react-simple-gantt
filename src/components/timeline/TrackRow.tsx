import { useState } from "react";
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
  renderTrackIndicator?: (date: Date) => React.ReactNode;
  itemStagger?: number;
}

// Height of a single stagger lane in px. Matches the default row minHeight so
// that stagger=0 is pixel-identical to the un-staggered layout.
const LANE_H = 48;
// Item bar height as a fraction of one lane. Matches the WorkItem `h-[60%]` class.
const ITEM_H_FRAC = 0.6;

/**
 * Greedy interval-scheduling lane assignment. Items that overlap are placed in
 * different lanes (rows). Returns an array aligned with `items` order where
 * each entry is the 0-based lane index for that item.
 */
function computeLanes<TData>(items: TimelineItem<TData>[]): number[] {
  const result = new Array<number>(items.length).fill(0);
  if (items.length === 0) return result;

  // Sort indices by start date so the greedy pass works correctly.
  const order = items
    .map((_, i) => i)
    .sort((a, b) => items[a].start.getTime() - items[b].start.getTime());

  // laneEnds[k] = the end Date of the last item assigned to lane k.
  // End dates are inclusive, so two items overlap when item.start <= laneEnds[k].
  const laneEnds: Date[] = [];

  for (const idx of order) {
    const item = items[idx];
    let assigned = -1;
    for (let k = 0; k < laneEnds.length; k++) {
      if (item.start > laneEnds[k]) {
        assigned = k;
        laneEnds[k] = item.end;
        break;
      }
    }
    if (assigned === -1) {
      assigned = laneEnds.length;
      laneEnds.push(item.end);
    }
    result[idx] = assigned;
  }

  return result;
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
  itemStagger,
}: TrackRowProps<TData>) {
  const [indicatorX, setIndicatorX] = useState<number | null>(null);
  const header = getTwoRowHeader(startDate, endDate, view, dayWidth);

  const stagger = itemStagger ?? 0;
  const lanes = stagger > 0 ? computeLanes(items) : null;
  const numLanes = lanes && lanes.length > 0 ? Math.max(...lanes) + 1 : 1;
  const itemBarH = LANE_H * ITEM_H_FRAC;
  // When stagger is active the row has an exact height; otherwise keep the
  // original minHeight so shorter content rows stay compact.
  const rowStyle: React.CSSProperties =
    stagger > 0
      ? {
          width: totalWidth,
          height: LANE_H + (numLanes - 1) * itemBarH * stagger,
        }
      : { width: totalWidth, minHeight: LANE_H };

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
      {/* Vertical grid lines aligned to bottom-row calendar units */}
      {header.bottomRow.map((_unit, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gray-100"
          style={{ left: gridLineOffsets[i] }}
        />
      ))}

      {items.map((item, idx) => {
        const { left, width } = itemToStyle(
          item as TimelineItem<unknown>,
          startDate,
          dayWidth,
        );
        const lane = lanes ? lanes[idx] : 0;
        const top =
          stagger > 0
            ? lane * itemBarH * stagger + (LANE_H - itemBarH) / 2
            : undefined;
        return (
          <WorkItem
            key={item.id}
            item={item}
            left={left}
            width={width}
            top={top}
            itemH={stagger > 0 ? itemBarH : undefined}
            isSelected={selectedItemId === item.id}
            isHovered={hoveredItemId === item.id}
            renderItem={renderItem}
            onClick={onItemClick}
            onMouseEnter={onItemHover}
            onMouseLeave={() => onItemHover(null)}
          />
        );
      })}

      {/* Hover indicator — follows cursor X, spans full row height */}
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
