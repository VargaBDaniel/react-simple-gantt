import { describe, expect, it } from "vitest";
import type { TimelineItem } from "../types/timeline.types";
import { dateToPixel, getTotalWidth, itemToStyle } from "./positionUtils";

describe("dateToPixel", () => {
  const start = new Date(2026, 0, 1); // Jan 1 2026
  const DAY = 40;

  it("returns 0 for the start date", () => {
    expect(dateToPixel(start, start, DAY)).toBe(0);
  });

  it("returns dayWidth for one day after start", () => {
    const next = new Date(2026, 0, 2);
    expect(dateToPixel(next, start, DAY)).toBe(40);
  });

  it("returns 7 * dayWidth for one week after start", () => {
    const week = new Date(2026, 0, 8);
    expect(dateToPixel(week, start, DAY)).toBe(7 * 40);
  });

  it("handles dates before start (negative offset)", () => {
    const before = new Date(2025, 11, 31);
    expect(dateToPixel(before, start, DAY)).toBe(-40);
  });
});

describe("itemToStyle", () => {
  const start = new Date(2026, 0, 1);
  const DAY = 40;

  it("item starting on startDate has left=0", () => {
    const item: TimelineItem = {
      id: "x",
      trackId: "t1",
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 3),
    };
    const { left, width } = itemToStyle(item, start, DAY);
    expect(left).toBe(0);
    expect(width).toBe(3 * DAY); // 3 days (1st, 2nd, 3rd = 3 calendar days)
  });

  it("item spanning 1 day has minimum width ≥ dayWidth/2", () => {
    const item: TimelineItem = {
      id: "y",
      trackId: "t1",
      start: new Date(2026, 0, 5),
      end: new Date(2026, 0, 5),
    };
    const { width } = itemToStyle(item, start, DAY);
    expect(width).toBeGreaterThanOrEqual(DAY / 2);
  });

  it("item offset 7 days from start has left = 7 * dayWidth", () => {
    const item: TimelineItem = {
      id: "z",
      trackId: "t1",
      start: new Date(2026, 0, 8),
      end: new Date(2026, 0, 10),
    };
    const { left } = itemToStyle(item, start, DAY);
    expect(left).toBe(7 * DAY);
  });
});

describe("getTotalWidth", () => {
  it("returns dayWidth for a single-day range", () => {
    const d = new Date(2026, 0, 1);
    expect(getTotalWidth(d, d, 40)).toBe(40);
  });

  it("returns correct width for a 31-day month", () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 0, 31);
    expect(getTotalWidth(start, end, 40)).toBe(31 * 40);
  });
});
