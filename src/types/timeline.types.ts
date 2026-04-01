import type { ReactNode } from "react";

export type ViewMode = "day" | "week" | "month";

export interface TimelineTrack {
  id: string;
  title: string | ReactNode;
}

export interface TimelineItem<TData = unknown> {
  id: string;
  trackId: string;
  start: Date;
  end: Date;
  label?: string;
  data?: TData;
}

export interface CalendarUnit {
  date: Date;
  label: string;
  widthPx: number;
}

export interface CalendarHeader {
  topRow: CalendarUnit[];
  bottomRow: CalendarUnit[];
}

export interface RenderItemProps<TData = unknown> {
  item: TimelineItem<TData>;
  isSelected: boolean;
  isHovered: boolean;
}

export interface UseTimelineConfig<TData = unknown> {
  tracks: TimelineTrack[];
  items: TimelineItem<TData>[];
  startDate: Date;
  endDate: Date;
  view?: ViewMode;
  /** Width in pixels of one day column. Default: 40 */
  dayWidth?: number;
  /** Width in pixels of the track label column. Default: 200 */
  labelWidth?: number;
  onItemClick?: (item: TimelineItem<TData>) => void;
  onItemHover?: (item: TimelineItem<TData> | null) => void;
  onTrackClick?: (trackId: string, date: Date) => void;
  renderItem?: (props: RenderItemProps<TData>) => ReactNode;
}

export interface TimelineProps<TData = unknown> {
  tracks: TimelineTrack[];
  itemsByTrack: Map<string, TimelineItem<TData>[]>;
  startDate: Date;
  endDate: Date;
  view: ViewMode;
  dayWidth: number;
  labelWidth: number;
  selectedItemId: string | null;
  hoveredItemId: string | null;
  renderItem?: (props: RenderItemProps<TData>) => ReactNode;
  onItemClick: (item: TimelineItem<TData>) => void;
  onItemHover: (item: TimelineItem<TData> | null) => void;
  onTrackClick: (trackId: string, date: Date) => void;
}

export interface UseTimelineReturn<TData = unknown> {
  getTimelineProps: () => TimelineProps<TData>;
  selectedItemId: string | null;
  hoveredItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
}
