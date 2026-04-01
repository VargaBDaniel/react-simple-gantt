import { describe, expect, it } from "vitest";
import { getTwoRowHeader } from "./dateUtils";

const DAY = 40;
const jan1 = new Date(2026, 0, 1);
const jan31 = new Date(2026, 0, 31);
const dec31 = new Date(2026, 11, 31);

describe("getTwoRowHeader – day view", () => {
  it("bottomRow has one entry per day", () => {
    const { bottomRow } = getTwoRowHeader(jan1, jan31, "day", DAY);
    expect(bottomRow).toHaveLength(31);
  });

  it("each bottom cell has widthPx = dayWidth", () => {
    const { bottomRow } = getTwoRowHeader(jan1, jan31, "day", DAY);
    bottomRow.forEach((u) => expect(u.widthPx).toBe(DAY));
  });

  it("topRow spans the whole month in one cell for a single-month range", () => {
    const { topRow } = getTwoRowHeader(jan1, jan31, "day", DAY);
    expect(topRow).toHaveLength(1);
    expect(topRow[0].widthPx).toBe(31 * DAY);
    expect(topRow[0].label).toContain("January");
  });

  it("topRow has two entries when range spans two months", () => {
    const feb28 = new Date(2026, 1, 28);
    const { topRow } = getTwoRowHeader(jan1, feb28, "day", DAY);
    expect(topRow).toHaveLength(2);
  });
});

describe("getTwoRowHeader – week view", () => {
  it("topRow contains month labels", () => {
    const { topRow } = getTwoRowHeader(jan1, jan31, "week", DAY);
    expect(topRow[0].label).toContain("January");
  });

  it("bottomRow has one entry per week-start within the range", () => {
    const { bottomRow } = getTwoRowHeader(jan1, jan31, "week", DAY);
    expect(bottomRow.length).toBeGreaterThanOrEqual(4);
    expect(bottomRow.length).toBeLessThanOrEqual(6);
  });
});

describe("getTwoRowHeader – month view", () => {
  it("bottomRow has 12 entries for a full year", () => {
    const { bottomRow } = getTwoRowHeader(jan1, dec31, "month", DAY);
    expect(bottomRow).toHaveLength(12);
  });

  it("topRow has one year cell for a single-year range", () => {
    const { topRow } = getTwoRowHeader(jan1, dec31, "month", DAY);
    expect(topRow).toHaveLength(1);
    expect(topRow[0].label).toBe("2026");
  });

  it("topRow has two entries spanning two years", () => {
    const dec1 = new Date(2025, 11, 1);
    const feb28 = new Date(2026, 1, 28);
    const { topRow } = getTwoRowHeader(dec1, feb28, "month", DAY);
    expect(topRow).toHaveLength(2);
  });
});
