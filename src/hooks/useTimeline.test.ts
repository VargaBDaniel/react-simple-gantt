import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TimelineItem, TimelineTrack } from "../types/timeline.types";
import { useTimeline } from "./useTimeline";

const tracks: TimelineTrack[] = [
  { id: "t1", title: "Track 1" },
  { id: "t2", title: "Track 2" },
];

const items: TimelineItem<{ priority: string }>[] = [
  {
    id: "i1",
    trackId: "t1",
    start: new Date(2026, 0, 1),
    end: new Date(2026, 0, 5),
    data: { priority: "high" },
  },
  {
    id: "i2",
    trackId: "t2",
    start: new Date(2026, 0, 3),
    end: new Date(2026, 0, 8),
    data: { priority: "low" },
  },
];

const baseConfig = {
  tracks,
  items,
  startDate: new Date(2026, 0, 1),
  endDate: new Date(2026, 0, 31),
};

describe("useTimeline", () => {
  it("returns null selectedItemId initially", () => {
    const { result } = renderHook(() => useTimeline(baseConfig));
    expect(result.current.selectedItemId).toBeNull();
  });

  it("selects an item on click", () => {
    const { result } = renderHook(() => useTimeline(baseConfig));
    act(() => {
      result.current.getTimelineProps().onItemClick(items[0]);
    });
    expect(result.current.selectedItemId).toBe("i1");
  });

  it("deselects an item on second click", () => {
    const { result } = renderHook(() => useTimeline(baseConfig));
    act(() => {
      result.current.getTimelineProps().onItemClick(items[0]);
    });
    act(() => {
      result.current.getTimelineProps().onItemClick(items[0]);
    });
    expect(result.current.selectedItemId).toBeNull();
  });

  it("switches selection to a different item", () => {
    const { result } = renderHook(() => useTimeline(baseConfig));
    act(() => {
      result.current.getTimelineProps().onItemClick(items[0]);
    });
    act(() => {
      result.current.getTimelineProps().onItemClick(items[1]);
    });
    expect(result.current.selectedItemId).toBe("i2");
  });

  it("sets hoveredItemId on hover", () => {
    const { result } = renderHook(() => useTimeline(baseConfig));
    act(() => {
      result.current.getTimelineProps().onItemHover(items[0]);
    });
    expect(result.current.hoveredItemId).toBe("i1");
  });

  it("clears hoveredItemId when hover called with null", () => {
    const { result } = renderHook(() => useTimeline(baseConfig));
    act(() => {
      result.current.getTimelineProps().onItemHover(items[0]);
    });
    act(() => {
      result.current.getTimelineProps().onItemHover(null);
    });
    expect(result.current.hoveredItemId).toBeNull();
  });

  it("calls onItemClick callback with the clicked item", () => {
    const onItemClick = vi.fn();
    const { result } = renderHook(() =>
      useTimeline({ ...baseConfig, onItemClick }),
    );
    act(() => {
      result.current.getTimelineProps().onItemClick(items[0]);
    });
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });

  it("groups items by trackId correctly", () => {
    const { result } = renderHook(() => useTimeline(baseConfig));
    const props = result.current.getTimelineProps();
    expect(props.itemsByTrack.get("t1")).toHaveLength(1);
    expect(props.itemsByTrack.get("t2")).toHaveLength(1);
    expect(props.itemsByTrack.get("t1")![0].id).toBe("i1");
  });

  it("types item.data correctly (TypeScript generic)", () => {
    const { result } = renderHook(() =>
      useTimeline<{ priority: string }>(baseConfig),
    );
    const props = result.current.getTimelineProps();
    const t1Items = props.itemsByTrack.get("t1")!;
    // data.priority is typed as string — no `any`
    const priority: string = t1Items[0].data!.priority;
    expect(priority).toBe("high");
  });

  it("setSelectedItemId allows external programmatic selection", () => {
    const { result } = renderHook(() => useTimeline(baseConfig));
    act(() => {
      result.current.setSelectedItemId("i2");
    });
    expect(result.current.selectedItemId).toBe("i2");
  });
});
