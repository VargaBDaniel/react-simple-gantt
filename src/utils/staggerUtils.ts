import type { TimelineItem } from "../types/timeline.types";

/** Pixel height of one un-staggered track row. */
export const LANE_H = 48;

/** Item bar height as a fraction of one lane — matches WorkItem's `h-[60%]`. */
export const ITEM_H_FRAC = 0.6;

/** Pixel height of an item bar in an un-staggered row. */
export const ITEM_BAR_H = LANE_H * ITEM_H_FRAC;

/**
 * Greedy interval-scheduling lane assignment.
 *
 * Items that overlap are placed in different lanes. Returns an array aligned
 * with `items` where each entry is the 0-based lane index for that item.
 *
 * Two items overlap when the later item's start date is not strictly after the
 * earlier item's end date (inclusive end convention).
 */
export function computeLanes<TData>(items: TimelineItem<TData>[]): number[] {
  const result = new Array<number>(items.length).fill(0);
  if (items.length === 0) return result;

  // Process items in ascending start-date order.
  const sorted = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.start.getTime() - b.item.start.getTime());

  // laneEnds[k] = end Date of the last item placed in lane k.
  const laneEnds: Date[] = [];

  for (const { item, index } of sorted) {
    const availableLane = laneEnds.findIndex((end) => item.start > end);
    const lane = availableLane === -1 ? laneEnds.length : availableLane;

    laneEnds[lane] = item.end;
    result[index] = lane;
  }

  return result;
}
