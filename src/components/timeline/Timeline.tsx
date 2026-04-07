import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import type { TimelineProps } from "../../types/timeline.types";
import { getTotalWidth } from "../../utils/positionUtils";
import { CalendarHeader } from "./CalendarHeader";
import { TrackLabel } from "./TrackLabel";
import { TrackRow } from "./TrackRow";

export function Timeline<TData = unknown>({
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
  onItemClick,
  onItemHover,
  onTrackClick,
  renderTrackIndicator,
  infiniteScroll = false,
  onDateWindowChange,
  itemStagger,
}: TimelineProps<TData>) {
  const { activeStart, activeEnd, containerRef, handleScroll } =
    useInfiniteScroll({
      startDate,
      endDate,
      dayWidth,
      enabled: infiniteScroll,
      onDateWindowChange,
    });

  const totalWidth = getTotalWidth(activeStart, activeEnd, dayWidth);

  return (
    <div
      ref={containerRef}
      className="overflow-auto border border-gray-200 rounded-md bg-white"
      style={infiniteScroll ? { overflowAnchor: "none" } : undefined}
      onScroll={infiniteScroll ? handleScroll : undefined}
    >
      {/*
       * Layout: flex rows inside a single scroll container.
       *
       * Each row is a full-width flex container (labelWidth + totalWidth).
       * This gives sticky labels a containing block that spans the entire
       * scroll width, so `position: sticky; left: 0` holds all the way across.
       *
       * A CSS grid was used previously, but grid cells constrain the sticky
       * range to the column width — causing labels to stop sticking after
       * scrolling ~labelWidth pixels.
       */}

      {/* ── Row 1: Calendar header — sticky to top ─────────────── */}
      <div className="sticky top-0 z-20 flex min-w-max">
        {/* Corner — sticky to left within the sticky header row */}
        <div
          className="sticky left-0 z-10 shrink-0 bg-white border-b border-r border-gray-200"
          style={{ width: labelWidth }}
        />
        <CalendarHeader
          startDate={activeStart}
          endDate={activeEnd}
          view={view}
          dayWidth={dayWidth}
          totalWidth={totalWidth}
        />
      </div>

      {/* ── Rows 2…n: Track rows ─────────────────────────────────── */}
      {tracks.map((track) => {
        const allItems = itemsByTrack.get(track.id) ?? [];
        // When infiniteScroll is active, only include items overlapping the current window.
        const trackItems = infiniteScroll
          ? allItems.filter(
              (item) => item.end >= activeStart && item.start <= activeEnd,
            )
          : allItems;
        return (
          <div key={track.id} className="flex min-w-max">
            {/* Label — sticky to left; full-width flex row = full sticking range */}
            <div
              className="sticky left-0 z-10 shrink-0"
              style={{ width: labelWidth }}
            >
              <TrackLabel title={track.title} />
            </div>

            <TrackRow
              trackId={track.id}
              items={trackItems}
              startDate={activeStart}
              endDate={activeEnd}
              totalWidth={totalWidth}
              dayWidth={dayWidth}
              view={view}
              selectedItemId={selectedItemId}
              hoveredItemId={hoveredItemId}
              renderItem={renderItem}
              onItemClick={onItemClick}
              onItemHover={onItemHover}
              onTrackClick={onTrackClick}
              renderTrackIndicator={renderTrackIndicator}
              itemStagger={itemStagger}
            />
          </div>
        );
      })}
    </div>
  );
}
