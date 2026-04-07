import { addDays, subDays as subtractDays } from "date-fns";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Days to add/remove when the user scrolls near either edge.
export const EXTEND_DAYS = 30;

// Pixel distance from an edge that triggers an extension.
const SCROLL_THRESHOLD_PX = 300;

interface UseInfiniteScrollOptions {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  enabled: boolean;
  onDateWindowChange?: (start: Date, end: Date) => void;
}

interface UseInfiniteScrollReturn {
  activeStart: Date;
  activeEnd: Date;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
}

/**
 * Manages the infinite-scroll date window for a timeline.
 *
 * When `enabled` is false, `activeStart`/`activeEnd` mirror the `startDate`/
 * `endDate` props directly and all scroll machinery is dormant.
 *
 * When `enabled` is true, the hook:
 * - pre-extends both edges by EXTEND_DAYS on mount so the user starts with a
 *   scroll buffer in both directions,
 * - listens for scroll events and extends the window when the user approaches
 *   either edge,
 * - compensates the scroll position after a left extension so the viewport
 *   stays visually anchored to the same date,
 * - re-anchors the viewport when `dayWidth` changes (view switch) or when
 *   `startDate`/`endDate` props change programmatically.
 */
export function useInfiniteScroll({
  startDate,
  endDate,
  dayWidth,
  enabled,
  onDateWindowChange,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const containerRef = useRef<HTMLDivElement>(null);

  // Internal date window — extended as the user scrolls.
  const [internalStart, setInternalStart] = useState(() =>
    enabled ? subtractDays(startDate, EXTEND_DAYS) : startDate,
  );
  const [internalEnd, setInternalEnd] = useState(() =>
    enabled ? addDays(endDate, EXTEND_DAYS) : endDate,
  );

  // ── Programmatic date-change detection ──
  //
  // We need to reset the internal window when the caller changes startDate /
  // endDate (e.g. "jump to quarter" buttons). React Compiler forbids reading
  // ref.current during render, so we use the "store info from previous renders"
  // useState pattern for the comparison, while keeping two effect-only refs
  // (`anchoredStartTsRef` / `anchoredEndTsRef`) that the layout effect writes to
  // mark each date change as handled.
  const [prevStartDateTs, setPrevStartDateTs] = useState(startDate.getTime());
  const [prevEndDateTs, setPrevEndDateTs] = useState(endDate.getTime());
  const anchoredStartTsRef = useRef(startDate.getTime());
  const anchoredEndTsRef = useRef(endDate.getTime());

  if (enabled) {
    const startTs = startDate.getTime();
    const endTs = endDate.getTime();
    if (startTs !== prevStartDateTs || endTs !== prevEndDateTs) {
      setPrevStartDateTs(startTs);
      setPrevEndDateTs(endTs);
      setInternalStart(subtractDays(startDate, EXTEND_DAYS));
      setInternalEnd(addDays(endDate, EXTEND_DAYS));
    }
  }

  // ── Scroll management refs ──

  // Whether a window extension is in-flight (state updated, DOM not yet committed).
  // When true, incoming scroll events are ignored to prevent stacking extensions.
  const isExtending = useRef(false);

  // Absolute scrollLeft target to restore after a left extension commits.
  // Stored as an absolute value (not a delta) so browser scroll-anchoring
  // adjustments don't cause a double-count.
  const pendingScrollAdjust = useRef(0);

  // Last observed scrollLeft — seeded to the initial anchor position so the
  // first scroll event produces a delta of 0.
  const prevScrollLeftRef = useRef(enabled ? EXTEND_DAYS * dayWidth : 0);

  // Snapshot refs — written only inside the layout effect, never during render.
  const prevDayWidthRef = useRef(dayWidth);
  const prevInternalStartRef = useRef(internalStart);
  const prevInternalEndRef = useRef(internalEnd);
  const hasMountedRef = useRef(false);

  // ── Callback ref ──
  //
  // Holds the latest onDateWindowChange so the notification effect doesn't
  // need to depend on it. Inline callbacks change identity every render and
  // would cause an infinite re-render loop if included in deps.
  const onDateWindowChangeRef = useRef(onDateWindowChange);
  useLayoutEffect(() => {
    onDateWindowChangeRef.current = onDateWindowChange;
  });

  // ── Scroll management — single no-dep layout effect ──
  //
  // Fires after every render. Ref-based change detection ensures only the
  // right branch runs. A single effect avoids two separate dep-array effects
  // both triggering on the same commit and overwriting each other's scrollLeft.
  //
  // Branch order:
  //   1. Mount           → anchor viewport, seed all snapshot refs
  //   2. Date prop reset → re-anchor to new range (setState already called during render)
  //   3. dayWidth change → re-anchor for view switch
  //   4. Window extended → apply left compensation or lock right position
  //   5. Other renders   → no-op
  useLayoutEffect(() => {
    if (!enabled || !containerRef.current) return;
    const el = containerRef.current;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      const initial = EXTEND_DAYS * dayWidth;
      el.scrollLeft = initial;
      prevScrollLeftRef.current = initial;
      prevDayWidthRef.current = dayWidth;
      prevInternalStartRef.current = internalStart;
      prevInternalEndRef.current = internalEnd;
      return;
    }

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

    if (dayWidth !== prevDayWidthRef.current) {
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

    const windowExtended =
      internalStart !== prevInternalStartRef.current ||
      internalEnd !== prevInternalEndRef.current;

    if (windowExtended) {
      prevInternalStartRef.current = internalStart;
      prevInternalEndRef.current = internalEnd;
      isExtending.current = false;

      if (pendingScrollAdjust.current > 0) {
        el.scrollLeft = pendingScrollAdjust.current;
        prevScrollLeftRef.current = pendingScrollAdjust.current;
        pendingScrollAdjust.current = 0;
      } else {
        // Right extension: lock position so child repaints don't shift scroll.
        el.scrollLeft = prevScrollLeftRef.current;
      }
    }
  });

  // Notify consumer when the window changes.
  useEffect(() => {
    if (enabled) {
      onDateWindowChangeRef.current?.(internalStart, internalEnd);
    }
  }, [enabled, internalStart, internalEnd]);

  // ── Scroll event handler ──

  function handleScroll() {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const curr = el.scrollLeft;
    const delta = curr - prevScrollLeftRef.current;
    prevScrollLeftRef.current = curr;

    if (isExtending.current) return;

    if (delta < 0 && curr < SCROLL_THRESHOLD_PX) {
      isExtending.current = true;
      pendingScrollAdjust.current = curr + EXTEND_DAYS * dayWidth;
      setInternalStart((prev) => subtractDays(prev, EXTEND_DAYS));
    } else if (
      delta > 0 &&
      curr + el.clientWidth > el.scrollWidth - SCROLL_THRESHOLD_PX
    ) {
      isExtending.current = true;
      setInternalEnd((prev) => addDays(prev, EXTEND_DAYS));
    }
  }

  const activeStart = enabled ? internalStart : startDate;
  const activeEnd = enabled ? internalEnd : endDate;

  return { activeStart, activeEnd, containerRef, handleScroll };
}
