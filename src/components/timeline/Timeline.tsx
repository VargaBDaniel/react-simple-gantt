import { addDays, subDays } from "date-fns";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TimelineProps } from "../../types/timeline.types";
import { getTotalWidth } from "../../utils/positionUtils";
import { CalendarHeader } from "./CalendarHeader";
import { TrackLabel } from "./TrackLabel";
import { TrackRow } from "./TrackRow";

const EXTEND_DAYS = 30;
const SCROLL_THRESHOLD_PX = 300;

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
  // ── Infinite-scroll date window ─────────────────────────────────────────
  // Pre-extend both edges by EXTEND_DAYS on initialisation:
  //  - Left buffer prevents an immediate left-extension on the first scroll.
  //  - Right buffer ensures totalWidth is large enough that the desired
  //    scrollLeft (EXTEND_DAYS * dayWidth) is reachable even when the
  //    caller's startDate–endDate range is narrow relative to the viewport.
  const [internalStart, setInternalStart] = useState(() =>
    infiniteScroll ? subDays(startDate, EXTEND_DAYS) : startDate,
  );
  const [internalEnd, setInternalEnd] = useState(() =>
    infiniteScroll ? addDays(endDate, EXTEND_DAYS) : endDate,
  );

  // Compensation to apply after a leftward window extension (see useLayoutEffect below).
  const pendingScrollAdjust = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track the previous scrollLeft to detect scroll direction. Pre-seeded to
  // the initial programmatic scroll offset so the first queued scroll event
  // produces delta = 0.
  const prevScrollLeftRef = useRef(infiniteScroll ? EXTEND_DAYS * dayWidth : 0);

  // Gate: while an extension is in-flight (state updated but DOM not yet
  // committed), further scroll events are ignored. Cleared in useLayoutEffect
  // after each commit so new extensions can begin immediately.
  const isExtending = useRef(false);

  // Track the previous dayWidth so we can detect view switches.
  const prevDayWidthRef = useRef(dayWidth);

  // Track previous internal window to detect extension commits.
  const prevInternalStartRef = useRef(internalStart);
  const prevInternalEndRef = useRef(internalEnd);

  // Detect programmatic startDate / endDate prop changes (e.g. a "jump to date"
  // button in the consumer). Uses React's "store info from previous renders" pattern
  // with useState — React Compiler forbids ref.current access during render, so
  // prevStartDateTs / prevEndDateTs are ordinary state, not refs.
  //
  // anchoredStartTsRef / anchoredEndTsRef are the timestamps the layout effect has
  // most recently processed. They are ONLY written inside the layout effect (never
  // during render), so comparing them to the current state lets the effect detect
  // "this is the first commit after a date change" without any ref reads at render time.
  const [prevStartDateTs, setPrevStartDateTs] = useState(startDate.getTime());
  const [prevEndDateTs, setPrevEndDateTs] = useState(endDate.getTime());
  const anchoredStartTsRef = useRef(startDate.getTime());
  const anchoredEndTsRef = useRef(endDate.getTime());

  if (infiniteScroll) {
    const startTs = startDate.getTime();
    const endTs = endDate.getTime();
    if (startTs !== prevStartDateTs || endTs !== prevEndDateTs) {
      // setState during render: React immediately re-renders before painting.
      // Safe per the "store info from previous renders" pattern.
      setPrevStartDateTs(startTs);
      setPrevEndDateTs(endTs);
      setInternalStart(subDays(startDate, EXTEND_DAYS));
      setInternalEnd(addDays(endDate, EXTEND_DAYS));
    }
  }

  // Hold the latest callback in a ref so the notification effect below doesn't
  // need to depend on it — an inline callback passed from the story/app changes
  // identity every render, which would cause an infinite setState → re-render
  // → new function → effect re-runs loop.
  // Updated in a layout effect (not during render) to satisfy React Compiler rules.
  const onDateWindowChangeRef = useRef(onDateWindowChange);
  useLayoutEffect(() => {
    onDateWindowChangeRef.current = onDateWindowChange;
  });

  // Single layout effect that owns all scroll-position management:
  //
  //  1. On mount (hasMounted starts false): anchor viewport to startDate.
  //  2. On startDate/endDate prop change (anchoredTs mismatch): re-anchor to new range.
  //     setState was already called during render; this branch only touches the DOM.
  //  3. On dayWidth change (view switch): re-anchor so dates stay stable.
  //  4. On internalStart/internalEnd change (extension commit): apply left-side
  //     scroll compensation and release the extension gate.
  //  5. Any other render: no-op.
  //
  // Running without a dep array means it fires after every render, but the
  // ref-based change detection ensures only the relevant branch executes.
  // This avoids two separate dep-array effects from both triggering on the
  // same commit and overwriting each other's scrollLeft correction.
  const hasMountedRef = useRef(false);
  useLayoutEffect(() => {
    if (!infiniteScroll || !containerRef.current) return;

    const el = containerRef.current;

    if (!hasMountedRef.current) {
      // Mount: anchor to startDate (which is EXTEND_DAYS into the content).
      hasMountedRef.current = true;
      const initial = EXTEND_DAYS * dayWidth;
      el.scrollLeft = initial;
      prevScrollLeftRef.current = initial;
      prevDayWidthRef.current = dayWidth;
      prevInternalStartRef.current = internalStart;
      prevInternalEndRef.current = internalEnd;
      return;
    }

    // Programmatic startDate / endDate prop change: setState was already called
    // during render, so internalStart / internalEnd are already the new values.
    // Compare current state timestamps to the last-anchored refs to detect the
    // first commit after a date change (refs only written here, never during render).
    const isDateReset =
      prevStartDateTs !== anchoredStartTsRef.current ||
      prevEndDateTs !== anchoredEndTsRef.current;
    if (isDateReset) {
      anchoredStartTsRef.current = prevStartDateTs;
      anchoredEndTsRef.current = prevEndDateTs;
      prevInternalStartRef.current = internalStart;
      prevInternalEndRef.current = internalEnd;
      pendingScrollAdjust.current = 0;
      isExtending.current = false;
      prevDayWidthRef.current = dayWidth;
      const newLeft = EXTEND_DAYS * dayWidth;
      el.scrollLeft = newLeft;
      prevScrollLeftRef.current = newLeft;
      return;
    }

    const dayWidthChanged = dayWidth !== prevDayWidthRef.current;

    if (dayWidthChanged) {
      // View switch: re-anchor viewport to startDate in new pixel space.
      // Cancel any in-flight extension so stale compensation isn't applied.
      prevDayWidthRef.current = dayWidth;
      pendingScrollAdjust.current = 0;
      isExtending.current = false;
      const newLeft = EXTEND_DAYS * dayWidth;
      el.scrollLeft = newLeft;
      prevScrollLeftRef.current = newLeft;
      prevInternalStartRef.current = internalStart;
      prevInternalEndRef.current = internalEnd;
      return;
    }

    const windowChanged =
      internalStart !== prevInternalStartRef.current ||
      internalEnd !== prevInternalEndRef.current;

    if (windowChanged) {
      // Extension commit: release gate and apply left-side compensation.
      prevInternalStartRef.current = internalStart;
      prevInternalEndRef.current = internalEnd;
      isExtending.current = false;
      if (pendingScrollAdjust.current > 0) {
        // pendingScrollAdjust holds the absolute target scrollLeft (not a delta).
        el.scrollLeft = pendingScrollAdjust.current;
        prevScrollLeftRef.current = pendingScrollAdjust.current;
        pendingScrollAdjust.current = 0;
      } else {
        // Right extension: no compensation needed, but lock scroll position
        // in case child components (e.g. the header virtualizer) moved it.
        el.scrollLeft = prevScrollLeftRef.current;
      }
    }
    // Any other render (selection, hover, etc.) — no-op.
  });

  // Notify consumer whenever the date window changes. Intentionally omits
  // onDateWindowChange from deps — we use the ref so callback identity changes
  // (common with inline functions) don't re-trigger this effect.
  useEffect(() => {
    if (infiniteScroll) {
      onDateWindowChangeRef.current?.(internalStart, internalEnd);
    }
  }, [infiniteScroll, internalStart, internalEnd]);

  const activeStart = infiniteScroll ? internalStart : startDate;
  const activeEnd = infiniteScroll ? internalEnd : endDate;
  const totalWidth = getTotalWidth(activeStart, activeEnd, dayWidth);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || !infiniteScroll) return;

    const curr = el.scrollLeft;
    const delta = curr - prevScrollLeftRef.current;
    prevScrollLeftRef.current = curr;

    // While an extension is pending (state updated, DOM not yet committed),
    // ignore further scroll events. This prevents multiple scroll events that
    // fire before React re-renders from stacking extensions whose combined
    // content shift would exceed the single pendingScrollAdjust compensation.
    if (isExtending.current) return;

    if (delta < 0 && curr < SCROLL_THRESHOLD_PX) {
      isExtending.current = true;
      // Store the absolute target scrollLeft after the extension commits.
      // We capture curr here (before any browser scroll-anchor adjustment)
      // and add the pixel width of the new content prepended to the left.
      // The compensation effect will set scrollLeft to this exact value
      // rather than doing a relative += which can double-count if the
      // browser's scroll-anchoring already moved scrollLeft.
      pendingScrollAdjust.current = curr + EXTEND_DAYS * dayWidth;
      setInternalStart((prev) => subDays(prev, EXTEND_DAYS));
    } else if (
      delta > 0 &&
      curr + el.clientWidth > el.scrollWidth - SCROLL_THRESHOLD_PX
    ) {
      isExtending.current = true;
      setInternalEnd((prev) => addDays(prev, EXTEND_DAYS));
    }
  };

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
