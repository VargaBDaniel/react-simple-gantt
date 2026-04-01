// Public library entry point
export { Timeline } from "./components/timeline/Timeline";
export { useTimeline } from "./hooks/useTimeline";

// Types for consumers
export type {
  RenderItemProps,
  TimelineItem,
  TimelineProps,
  TimelineTrack,
  UseTimelineConfig,
  UseTimelineReturn,
  ViewMode,
} from "./types/timeline.types";
