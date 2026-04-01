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
}: TimelineProps<TData>) {
  const totalWidth = getTotalWidth(startDate, endDate, dayWidth);

  return (
    <div className="overflow-auto border border-gray-200 rounded-md">
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
          startDate={startDate}
          endDate={endDate}
          view={view}
          dayWidth={dayWidth}
          totalWidth={totalWidth}
        />
      </div>

      {/* ── Rows 2…n: Track rows ─────────────────────────────────── */}
      {tracks.map((track) => {
        const trackItems = itemsByTrack.get(track.id) ?? [];
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
              startDate={startDate}
              endDate={endDate}
              totalWidth={totalWidth}
              dayWidth={dayWidth}
              view={view}
              selectedItemId={selectedItemId}
              hoveredItemId={hoveredItemId}
              renderItem={renderItem}
              onItemClick={onItemClick}
              onItemHover={onItemHover}
              onTrackClick={onTrackClick}
            />
          </div>
        );
      })}
    </div>
  );
}
