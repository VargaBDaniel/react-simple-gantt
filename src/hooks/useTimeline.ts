import { useState } from "react";
import type {
  TimelineItem,
  TimelineProps,
  UseTimelineConfig,
  UseTimelineReturn,
} from "../types/timeline.types";

const DEFAULT_VIEW = "day" as const;
const DEFAULT_DAY_WIDTH = 40;
const DEFAULT_LABEL_WIDTH = 200;

export function useTimeline<TData = unknown>(
  config: UseTimelineConfig<TData>,
): UseTimelineReturn<TData> {
  const {
    tracks,
    items,
    startDate,
    endDate,
    view = DEFAULT_VIEW,
    dayWidth = DEFAULT_DAY_WIDTH,
    labelWidth = DEFAULT_LABEL_WIDTH,
    onItemClick,
    onItemHover,
    onTrackClick,
    renderItem,
    renderTrackIndicator,
    infiniteScroll,
    onDateWindowChange,
    itemStagger,
  } = config;

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // React Compiler handles memoization — no useMemo/useCallback needed.
  const itemsByTrack = new Map<string, TimelineItem<TData>[]>();
  for (const item of items) {
    const existing = itemsByTrack.get(item.trackId);
    if (existing) {
      existing.push(item);
    } else {
      itemsByTrack.set(item.trackId, [item]);
    }
  }

  const handleItemClick = (item: TimelineItem<TData>) => {
    setSelectedItemId((prev) => (prev === item.id ? null : item.id));
    onItemClick?.(item);
  };

  const handleItemHover = (item: TimelineItem<TData> | null) => {
    setHoveredItemId(item?.id ?? null);
    onItemHover?.(item);
  };

  const handleTrackClick = (trackId: string, date: Date) => {
    onTrackClick?.(trackId, date);
  };

  const getTimelineProps = (): TimelineProps<TData> => ({
    tracks,
    itemsByTrack,
    startDate,
    endDate,
    view,
    dayWidth,
    labelWidth,
    selectedItemId,
    hoveredItemId,
    renderItem,
    onItemClick: handleItemClick,
    onItemHover: handleItemHover,
    onTrackClick: handleTrackClick,
    renderTrackIndicator,
    infiniteScroll,
    onDateWindowChange,
    itemStagger,
  });

  return { getTimelineProps, selectedItemId, hoveredItemId, setSelectedItemId };
}
