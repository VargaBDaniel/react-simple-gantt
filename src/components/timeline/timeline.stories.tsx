import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { useTimeline } from "../../hooks/useTimeline";
import type { TimelineItem, ViewMode } from "../../types/timeline.types";
import { Timeline } from "./Timeline";

// ─── Shared sample data ──────────────────────────────────────────────────────

type TaskData = { priority: "high" | "medium" | "low"; assignee: string };

const TRACKS = [
  { id: "design", title: "Design" },
  { id: "frontend", title: "Frontend" },
  { id: "backend", title: "Backend" },
  { id: "qa", title: "QA" },
  { id: "devops", title: "DevOps" },
];

const ITEMS: TimelineItem<TaskData>[] = [
  {
    id: "t1",
    trackId: "design",
    start: new Date(2026, 0, 5),
    end: new Date(2026, 0, 14),
    label: "Wireframes",
    data: { priority: "high", assignee: "Alice" },
  },
  {
    id: "t2",
    trackId: "design",
    start: new Date(2026, 0, 16),
    end: new Date(2026, 0, 26),
    label: "Visual design",
    data: { priority: "medium", assignee: "Alice" },
  },
  {
    id: "t3",
    trackId: "frontend",
    start: new Date(2026, 0, 8),
    end: new Date(2026, 0, 23),
    label: "Component lib",
    data: { priority: "high", assignee: "Bob" },
  },
  {
    id: "t4",
    trackId: "frontend",
    start: new Date(2026, 0, 24),
    end: new Date(2026, 1, 10),
    label: "Integration",
    data: { priority: "high", assignee: "Carol" },
  },
  {
    id: "t5",
    trackId: "backend",
    start: new Date(2026, 0, 6),
    end: new Date(2026, 0, 20),
    label: "API design",
    data: { priority: "medium", assignee: "Dave" },
  },
  {
    id: "t6",
    trackId: "backend",
    start: new Date(2026, 0, 20),
    end: new Date(2026, 1, 8),
    label: "Auth service",
    data: { priority: "high", assignee: "Dave" },
  },
  {
    id: "t7",
    trackId: "backend",
    start: new Date(2026, 1, 9),
    end: new Date(2026, 1, 24),
    label: "Notifications",
    data: { priority: "low", assignee: "Eve" },
  },
  {
    id: "t8",
    trackId: "qa",
    start: new Date(2026, 0, 26),
    end: new Date(2026, 1, 12),
    label: "Test planning",
    data: { priority: "medium", assignee: "Frank" },
  },
  {
    id: "t9",
    trackId: "qa",
    start: new Date(2026, 1, 13),
    end: new Date(2026, 1, 25),
    label: "Regression suite",
    data: { priority: "high", assignee: "Frank" },
  },
  {
    id: "t10",
    trackId: "devops",
    start: new Date(2026, 0, 12),
    end: new Date(2026, 0, 18),
    label: "CI pipeline",
    data: { priority: "medium", assignee: "Grace" },
  },
  {
    id: "t11",
    trackId: "devops",
    start: new Date(2026, 1, 1),
    end: new Date(2026, 1, 10),
    label: "Staging deploy",
    data: { priority: "low", assignee: "Grace" },
  },
];

const START_DATE = new Date(2026, 0, 1);
const END_DATE = new Date(2026, 2, 15);

// ─── Storybook meta ──────────────────────────────────────────────────────────

// Meta is not bound to Timeline's component props because all stories
// use render + useTimeline internally — args would not apply.
const meta = {
  title: "Timeline",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Story 1: Interactive — view switcher + selection + hover tooltip ────────

export const Interactive: Story = {
  render: () => {
    const [view, setView] = useState<ViewMode>("day");
    const [selected, setSelected] = useState<TimelineItem<TaskData> | null>(
      null,
    );
    const [hovered, setHovered] = useState<TimelineItem<TaskData> | null>(null);
    const [trackClick, setTrackClick] = useState<{
      trackId: string;
      date: Date;
    } | null>(null);

    const dayWidth = view === "day" ? 36 : view === "week" ? 18 : 10;

    const timeline = useTimeline<TaskData>({
      tracks: TRACKS,
      items: ITEMS,
      startDate: START_DATE,
      endDate: END_DATE,
      view,
      dayWidth,
      onItemClick: (item) =>
        setSelected((prev) => (prev?.id === item.id ? null : item)),
      onItemHover: (item) => setHovered(item),
      onTrackClick: (trackId, date) => setTrackClick({ trackId, date }),
      infiniteScroll: true,
      onDateWindowChange: (start, end) =>
        console.log(
          "[Timeline] window:",
          start.toDateString(),
          "→",
          end.toDateString(),
        ),
      renderTrackIndicator: (date) => (
        <div className="flex flex-col items-center h-full">
          <span className="text-[10px] bg-blue-500 text-white rounded px-1 whitespace-nowrap -translate-x-1/2 leading-5">
            {date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          <div className="flex-1 border-l border-dashed border-blue-400 opacity-60" />
        </div>
      ),
    });

    const VIEWS: ViewMode[] = ["day", "week", "month"];

    return (
      <div className="p-6 flex flex-col gap-4 bg-gray-50 min-h-screen font-sans">
        {/* Toolbar */}
        <div className="flex items-center gap-3 h-8 flex-wrap">
          <h1 className="text-lg font-semibold text-gray-800 mr-2">
            Project roadmap
          </h1>
          <div className="flex h-full rounded-md border border-gray-300 overflow-hidden">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-sm capitalize transition-colors ${
                  view === v
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {hovered && (
            <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 h-full text-sm shadow-sm">
              <span className="text-gray-400">Hovering:</span>
              <span className="font-medium text-gray-700">{hovered.label}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{hovered.data?.assignee}</span>
            </div>
          )}

          {trackClick && (
            <div
              className={`${hovered ? "" : "ml-auto"} flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 h-full text-sm shadow-sm`}
            >
              <span className="text-gray-400">Track click:</span>
              <span className="font-medium text-gray-700">
                {TRACKS.find((t) => t.id === trackClick.trackId)?.title ??
                  trackClick.trackId}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">
                {trackClick.date.toLocaleDateString()}
              </span>
              <button
                onClick={() => setTrackClick(null)}
                className="text-gray-300 hover:text-gray-500 leading-none"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Timeline */}
        <Timeline {...timeline.getTimelineProps()} />

        {/* Selection detail panel */}
        {selected && (
          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm flex gap-6 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                Task
              </p>
              <p className="text-base font-semibold text-gray-800">
                {selected.label}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                Assignee
              </p>
              <p className="text-sm text-gray-700">{selected.data?.assignee}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                Priority
              </p>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  selected.data?.priority === "high"
                    ? "bg-red-100 text-red-700"
                    : selected.data?.priority === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {selected.data?.priority}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                Duration
              </p>
              <p className="text-sm text-gray-700">
                {selected.start.toLocaleDateString()} →{" "}
                {selected.end.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  },
};

// ─── Story 2: Custom item renderer — priority-coloured bars with assignee ────

const PRIORITY_CLASSES: Record<TaskData["priority"], string> = {
  high: "bg-red-500 hover:bg-red-600",
  medium: "bg-amber-400 hover:bg-amber-500",
  low: "bg-emerald-400 hover:bg-emerald-500",
};

export const CustomItemRenderer: Story = {
  render: () => {
    const timeline = useTimeline<TaskData>({
      tracks: TRACKS,
      items: ITEMS,
      startDate: START_DATE,
      endDate: END_DATE,
      view: "day",
      dayWidth: 36,
      renderItem: ({ item, isSelected, isHovered }) => {
        const priority = item.data?.priority ?? "low";
        return (
          <div
            className={`h-full w-full flex items-center gap-1.5 px-2 rounded transition-all
              ${PRIORITY_CLASSES[priority]}
              ${isSelected ? "ring-2 ring-white ring-offset-1" : ""}
              ${isHovered ? "brightness-110" : ""}
            `}
          >
            <span
              className={`shrink-0 w-1.5 h-1.5 rounded-full bg-white opacity-80`}
            />
            <span className="text-xs text-white font-medium truncate">
              {item.label}
            </span>
            <span className="ml-auto text-[10px] text-white/70 truncate hidden sm:block">
              {item.data?.assignee}
            </span>
          </div>
        );
      },
    });

    return (
      <div className="p-6 flex flex-col gap-3 bg-gray-50 min-h-screen font-sans">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-800">
            Custom renderer — priority colours
          </h1>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />{" "}
              High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{" "}
              Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />{" "}
              Low
            </span>
          </div>
        </div>
        <Timeline {...timeline.getTimelineProps()} />
      </div>
    );
  },
};

// ─── Story 3: ReactNode track titles — avatar + label ────────────────────────

const AVATARS: Record<string, string> = {
  design: "🎨",
  frontend: "⚛️",
  backend: "🛠️",
  qa: "🧪",
  devops: "🚀",
};

const richTracks = TRACKS.map((t) => ({
  ...t,
  title: (
    <div className="flex items-center gap-2">
      <span className="text-base leading-none">{AVATARS[t.id]}</span>
      <span>{t.title}</span>
    </div>
  ),
}));

export const RichTrackTitles: Story = {
  render: () => {
    const timeline = useTimeline<TaskData>({
      tracks: richTracks,
      items: ITEMS,
      startDate: START_DATE,
      endDate: END_DATE,
      view: "week",
      dayWidth: 22,
      labelWidth: 160,
    });

    return (
      <div className="p-6 flex flex-col gap-3 bg-gray-50 min-h-screen font-sans">
        <h1 className="text-lg font-semibold text-gray-800">
          ReactNode track titles — week view
        </h1>
        <Timeline {...timeline.getTimelineProps()} />
      </div>
    );
  },
};

// ─── Story 4: InfiniteScroll — live window readout + load log ────────────────
//
// Clean showcase focused entirely on infinite scroll. Rendered in a fixed-
// height container so the scroll bar is always visible. A log panel below
// records every time the window expands so the consumer pattern is obvious.

export const InfiniteScroll: Story = {
  render: () => {
    const [log, setLog] = useState<string[]>([]);

    const timeline = useTimeline<TaskData>({
      tracks: TRACKS,
      items: ITEMS,
      startDate: START_DATE,
      endDate: END_DATE, // Jan 1 – Mar 15, plenty of room before edges
      view: "day",
      dayWidth: 36,
      infiniteScroll: true,
      onDateWindowChange: (start, end) => {
        const entry = `${start.toLocaleDateString()} → ${end.toLocaleDateString()}`;
        setLog((prev) => [entry, ...prev].slice(0, 8));
      },
    });

    return (
      <div className="p-6 flex flex-col gap-4 bg-gray-50 min-h-screen font-sans">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Infinite scroll
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Scroll left or right past the edge — the timeline extends
            automatically and the date window is logged below.
          </p>
        </div>

        {/* Fixed-height wrapper makes the scrollbar always visible */}
        <div className="h-64">
          <Timeline {...timeline.getTimelineProps()} />
        </div>

        {/* Window expansion log */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            onDateWindowChange log
          </p>
          {log.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No expansions yet — scroll to the edges.
            </p>
          ) : (
            <ul className="space-y-1">
              {log.map((entry, i) => (
                <li
                  key={i}
                  className={`text-sm font-mono ${i === 0 ? "text-blue-600 font-medium" : "text-gray-500"}`}
                >
                  {i === 0 && (
                    <span className="text-[10px] bg-blue-100 text-blue-600 font-sans rounded px-1 py-0.5 mr-2 align-middle">
                      latest
                    </span>
                  )}
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
};

// ─── Story 5: InfiniteScroll — item spanning the expansion boundary ──────────
//
// Edge case: a work item whose end date is beyond the initial endDate. When
// the window expands rightward the item should appear without any positional
// jump. An item anchored before the initial startDate tests leftward expansion.

const BOUNDARY_ITEMS: TimelineItem<TaskData>[] = [
  // Starts well before the initial window — tests left expansion
  {
    id: "b1",
    trackId: "frontend",
    start: new Date(2026, 0, 1),
    end: new Date(2026, 0, 8),
    label: "Pre-window task",
    data: { priority: "medium", assignee: "Bob" },
  },
  // Straddles the right boundary of the initial endDate (Jan 20)
  {
    id: "b2",
    trackId: "backend",
    start: new Date(2026, 0, 16),
    end: new Date(2026, 0, 28), // extends beyond initial Jan 20 end
    label: "Spanning task",
    data: { priority: "high", assignee: "Dave" },
  },
  // Starts in March — outside the initial pre-extended window (Jan 20 + 30 days
  // = Feb 19), so it only appears after the first rightward extension.
  {
    id: "b3",
    trackId: "qa",
    start: new Date(2026, 2, 1),
    end: new Date(2026, 2, 10),
    label: "Future task",
    data: { priority: "low", assignee: "Frank" },
  },
];

export const InfiniteScrollBoundaryItems: Story = {
  render: () => {
    const timeline = useTimeline<TaskData>({
      tracks: TRACKS,
      items: BOUNDARY_ITEMS,
      startDate: new Date(2026, 0, 10), // start mid-January
      endDate: new Date(2026, 0, 20), // only 10 days visible initially
      view: "day",
      dayWidth: 40,
      infiniteScroll: true,
    });

    return (
      <div className="p-6 flex flex-col gap-4 bg-gray-50 min-h-screen font-sans">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Infinite scroll — boundary items
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Initial window is Jan 10–20 (both edges pre-buffered by 30 days).
            "Spanning task" straddles the right edge. Scroll right past Feb 19
            to trigger an extension and reveal "Future task" in March. Scroll
            left to reveal "Pre-window task".
          </p>
        </div>
        <div className="h-64">
          <Timeline {...timeline.getTimelineProps()} />
        </div>
      </div>
    );
  },
};

// ─── Story 6: InfiniteScroll — async data loading simulation ─────────────────
//
// Edge case: the consumer fetches new items asynchronously when the window
// changes. Simulates a 600 ms network delay with a loading indicator.
// Tests that items arriving after the window has expanded are positioned
// correctly and don't cause a layout shift.

function generateItemsForWindow(
  start: Date,
  end: Date,
): TimelineItem<TaskData>[] {
  const result: TimelineItem<TaskData>[] = [];
  const MS_PER_DAY = 86_400_000;
  const days = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);

  TRACKS.forEach((track, ti) => {
    // One item per track per ~2-week block, offset by track index so they
    // don't all line up on the same column.
    for (let d = ti * 3; d < days; d += 14) {
      const itemStart = new Date(start.getTime() + d * MS_PER_DAY);
      const itemEnd = new Date(itemStart.getTime() + (5 + ti) * MS_PER_DAY);
      if (itemEnd > end) break;
      result.push({
        id: `gen-${track.id}-${itemStart.getTime()}`,
        trackId: track.id,
        start: itemStart,
        end: itemEnd,
        label: `${track.title} task`,
        data: {
          priority: (["high", "medium", "low"] as const)[ti % 3],
          assignee: ["Alice", "Bob", "Dave", "Frank", "Grace"][ti],
        },
      });
    }
  });
  return result;
}

export const InfiniteScrollAsyncData: Story = {
  render: () => {
    const [items, setItems] = useState<TimelineItem<TaskData>[]>(() =>
      generateItemsForWindow(START_DATE, END_DATE),
    );
    const [loading, setLoading] = useState(false);
    // Track which windows we have already fetched so we don't re-fetch.
    const fetchedWindows = useRef(new Set<string>());

    const timeline = useTimeline<TaskData>({
      tracks: TRACKS,
      items,
      startDate: START_DATE,
      endDate: END_DATE,
      view: "day",
      dayWidth: 36,
      infiniteScroll: true,
      onDateWindowChange: (start, end) => {
        const key = `${start.getTime()}-${end.getTime()}`;
        if (fetchedWindows.current.has(key)) return;
        fetchedWindows.current.add(key);

        setLoading(true);
        // Simulate a 600 ms async fetch
        setTimeout(() => {
          setItems((prev) => {
            const newItems = generateItemsForWindow(start, end);
            // Merge, deduplicating by id
            const existingIds = new Set(prev.map((i) => i.id));
            return [...prev, ...newItems.filter((i) => !existingIds.has(i.id))];
          });
          setLoading(false);
        }, 600);
      },
    });

    // Seed the initial window key so it isn't re-fetched on first expansion.
    useEffect(() => {
      fetchedWindows.current.add(
        `${START_DATE.getTime()}-${END_DATE.getTime()}`,
      );
    }, []);

    return (
      <div className="p-6 flex flex-col gap-4 bg-gray-50 min-h-screen font-sans">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Infinite scroll — async data loading
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Scroll to an edge — new items are fetched with a simulated 600 ms
              delay. Items appear without layout shifts after loading.
            </p>
          </div>
          {loading && (
            <div className="ml-auto flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
              <svg
                className="animate-spin h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Loading…
            </div>
          )}
        </div>
        <div className="h-72">
          <Timeline {...timeline.getTimelineProps()} />
        </div>
        <p className="text-xs text-gray-400">
          {items.length} items loaded across all tracks
        </p>
      </div>
    );
  },
};

// ─── Story 7: Empty state — no items on any track ────────────────────────────
//
// Edge case: consumer provides tracks but no items. Every track row should
// render as an empty-yet-correct-height row; nothing should crash or collapse.

export const EmptyState: Story = {
  render: () => {
    const timeline = useTimeline<TaskData>({
      tracks: TRACKS,
      items: [],
      startDate: START_DATE,
      endDate: new Date(2026, 1, 28),
      view: "day",
      dayWidth: 36,
    });

    return (
      <div className="p-6 flex flex-col gap-3 bg-gray-50 min-h-screen font-sans">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Empty state — no items
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All tracks are present but have zero items. Rows should render at
            correct height with no crashes or collapsed layout.
          </p>
        </div>
        <Timeline {...timeline.getTimelineProps()} />
      </div>
    );
  },
};

// ─── Story 8: Overlapping items on the same track ────────────────────────────
//
// Edge case: multiple items on a single track whose date ranges overlap.
// They render as absolutely-positioned bars on the same row — the later item
// in DOM order (and higher z-index when selected/hovered) wins visually.
// This story makes the overlap obvious so consumers know to either prevent
// overlaps upstream or use a custom renderer that stacks rows.

const OVERLAP_TRACKS = [
  { id: "track-a", title: "Track A — heavy overlap" },
  { id: "track-b", title: "Track B — partial overlap" },
  { id: "track-c", title: "Track C — touching (no overlap)" },
];

const OVERLAP_ITEMS: TimelineItem<TaskData>[] = [
  // Track A: three items all covering Jan 5–25 (fully overlapping)
  {
    id: "oa1",
    trackId: "track-a",
    start: new Date(2026, 0, 5),
    end: new Date(2026, 0, 25),
    label: "Task A1",
    data: { priority: "high", assignee: "Alice" },
  },
  {
    id: "oa2",
    trackId: "track-a",
    start: new Date(2026, 0, 8),
    end: new Date(2026, 0, 20),
    label: "Task A2",
    data: { priority: "medium", assignee: "Bob" },
  },
  {
    id: "oa3",
    trackId: "track-a",
    start: new Date(2026, 0, 12),
    end: new Date(2026, 0, 18),
    label: "Task A3 (innermost)",
    data: { priority: "low", assignee: "Carol" },
  },
  // Track B: two items with a partial overlap in the middle
  {
    id: "ob1",
    trackId: "track-b",
    start: new Date(2026, 0, 3),
    end: new Date(2026, 0, 18),
    label: "Task B1",
    data: { priority: "high", assignee: "Dave" },
  },
  {
    id: "ob2",
    trackId: "track-b",
    start: new Date(2026, 0, 14),
    end: new Date(2026, 0, 28),
    label: "Task B2",
    data: { priority: "medium", assignee: "Eve" },
  },
  // Track C: two items that touch end-to-end but don't overlap
  {
    id: "oc1",
    trackId: "track-c",
    start: new Date(2026, 0, 5),
    end: new Date(2026, 0, 15),
    label: "Task C1",
    data: { priority: "low", assignee: "Frank" },
  },
  {
    id: "oc2",
    trackId: "track-c",
    start: new Date(2026, 0, 15),
    end: new Date(2026, 0, 25),
    label: "Task C2",
    data: { priority: "low", assignee: "Grace" },
  },
];

export const OverlappingItems: Story = {
  render: () => {
    const timeline = useTimeline<TaskData>({
      tracks: OVERLAP_TRACKS,
      items: OVERLAP_ITEMS,
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 1, 1),
      view: "day",
      dayWidth: 36,
    });

    return (
      <div className="p-6 flex flex-col gap-3 bg-gray-50 min-h-screen font-sans">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Overlapping items
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track A has three fully-overlapping items. Track B has two
            partially-overlapping items. Track C has two items that touch but do
            not overlap. Later items in DOM order paint on top; selecting or
            hovering an item brings it to the front via z-index.
          </p>
        </div>
        <Timeline {...timeline.getTimelineProps()} />
      </div>
    );
  },
};

// ─── Story 9: Single-day and point-in-time items ─────────────────────────────
//
// Edge case: items whose start === end (zero duration) and items that span
// exactly one day. WorkItem renders them with width derived from
// itemToStyle — a zero or near-zero width must not collapse or crash.

const POINT_TRACKS = [
  { id: "milestones", title: "Milestones (same-day)" },
  { id: "oneday", title: "One-day tasks" },
  { id: "normal", title: "Normal tasks (reference)" },
];

const POINT_ITEMS: TimelineItem<TaskData>[] = [
  // Zero-duration milestone events
  {
    id: "m1",
    trackId: "milestones",
    start: new Date(2026, 0, 5),
    end: new Date(2026, 0, 5),
    label: "Kickoff",
    data: { priority: "high", assignee: "Alice" },
  },
  {
    id: "m2",
    trackId: "milestones",
    start: new Date(2026, 0, 12),
    end: new Date(2026, 0, 12),
    label: "Design review",
    data: { priority: "medium", assignee: "Bob" },
  },
  {
    id: "m3",
    trackId: "milestones",
    start: new Date(2026, 0, 20),
    end: new Date(2026, 0, 20),
    label: "Code freeze",
    data: { priority: "high", assignee: "Carol" },
  },
  {
    id: "m4",
    trackId: "milestones",
    start: new Date(2026, 0, 28),
    end: new Date(2026, 0, 28),
    label: "Release",
    data: { priority: "high", assignee: "Dave" },
  },
  // One-day tasks (end === start, same calendar day)
  {
    id: "d1",
    trackId: "oneday",
    start: new Date(2026, 0, 6),
    end: new Date(2026, 0, 6),
    label: "Deploy patch",
    data: { priority: "high", assignee: "Eve" },
  },
  {
    id: "d2",
    trackId: "oneday",
    start: new Date(2026, 0, 14),
    end: new Date(2026, 0, 14),
    label: "Hotfix",
    data: { priority: "high", assignee: "Frank" },
  },
  {
    id: "d3",
    trackId: "oneday",
    start: new Date(2026, 0, 22),
    end: new Date(2026, 0, 22),
    label: "DB migration",
    data: { priority: "medium", assignee: "Grace" },
  },
  // Normal multi-day reference items so the row height is consistent
  {
    id: "n1",
    trackId: "normal",
    start: new Date(2026, 0, 3),
    end: new Date(2026, 0, 13),
    label: "Sprint 1",
    data: { priority: "medium", assignee: "Alice" },
  },
  {
    id: "n2",
    trackId: "normal",
    start: new Date(2026, 0, 14),
    end: new Date(2026, 0, 24),
    label: "Sprint 2",
    data: { priority: "medium", assignee: "Bob" },
  },
];

export const SingleDayItems: Story = {
  render: () => {
    const timeline = useTimeline<TaskData>({
      tracks: POINT_TRACKS,
      items: POINT_ITEMS,
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 1, 1),
      view: "day",
      dayWidth: 36,
      renderItem: ({ item, isSelected, isHovered }) => {
        const isMilestone = item.start.getTime() === item.end.getTime();
        return isMilestone ? (
          // Diamond milestone marker
          <div
            className={`h-full w-full flex items-center justify-center
              ${isSelected ? "opacity-100" : isHovered ? "opacity-90" : "opacity-80"}`}
          >
            <div
              className={`w-3 h-3 rotate-45 shrink-0
                ${isSelected ? "bg-purple-600 ring-2 ring-purple-300" : "bg-purple-500"}`}
            />
          </div>
        ) : (
          <div className="h-full w-full flex items-center px-1 overflow-hidden">
            <span className="text-[10px] text-white font-medium truncate leading-none">
              {item.label}
            </span>
          </div>
        );
      },
    });

    return (
      <div className="p-6 flex flex-col gap-3 bg-gray-50 min-h-screen font-sans">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Single-day &amp; point-in-time items
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            "Milestones" track has zero-duration items (start === end) rendered
            as diamond markers. "One-day tasks" also uses start === end —
            <code>end</code> is inclusive, so a single-day task occupies exactly
            one column. Both should render at correct width.
          </p>
        </div>
        <Timeline {...timeline.getTimelineProps()} />
      </div>
    );
  },
};

// ─── Story 10: Many tracks — vertical scroll + sticky header/labels ───────────
//
// Edge case: a large number of tracks to confirm the sticky header row and
// sticky label column remain fixed while the body scrolls vertically.

const MANY_TRACKS = Array.from({ length: 20 }, (_, i) => ({
  id: `team-${i + 1}`,
  title: `Team ${i + 1}`,
}));

const MANY_ITEMS: TimelineItem<TaskData>[] = MANY_TRACKS.flatMap(
  (track, ti) => {
    const priorities = ["high", "medium", "low"] as const;
    const assignees = ["Alice", "Bob", "Carol", "Dave", "Eve"];
    const offset = ti * 2; // stagger start by 2 days per track
    return [
      {
        id: `${track.id}-a`,
        trackId: track.id,
        start: new Date(2026, 0, 1 + offset),
        end: new Date(2026, 0, 10 + offset),
        label: `${track.title} — phase 1`,
        data: { priority: priorities[ti % 3], assignee: assignees[ti % 5] },
      },
      {
        id: `${track.id}-b`,
        trackId: track.id,
        start: new Date(2026, 0, 12 + offset),
        end: new Date(2026, 0, 22 + offset),
        label: `${track.title} — phase 2`,
        data: {
          priority: priorities[(ti + 1) % 3],
          assignee: assignees[(ti + 2) % 5],
        },
      },
    ];
  },
);

export const ManyTracks: Story = {
  render: () => {
    const timeline = useTimeline<TaskData>({
      tracks: MANY_TRACKS,
      items: MANY_ITEMS,
      startDate: START_DATE,
      endDate: new Date(2026, 2, 1),
      view: "day",
      dayWidth: 32,
    });

    return (
      <div className="p-6 flex flex-col gap-3 bg-gray-50 font-sans">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Many tracks — sticky header &amp; labels
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            20 tracks. Scroll down — the calendar header should stay pinned to
            the top. Scroll right — the track label column should stay pinned to
            the left.
          </p>
        </div>
        {/* Fixed height forces vertical overflow so sticky behaviour is exercised */}
        <div className="h-120">
          <Timeline {...timeline.getTimelineProps()} />
        </div>
      </div>
    );
  },
};

// ─── Story 11: Out-of-window items — clipping at fixed range boundary ────────
//
// Edge case: items whose start < startDate or end > endDate when infiniteScroll
// is off. TrackRow uses overflow: hidden so straddling items clip cleanly at
// [0, totalWidth] — the in-window portion is shown, and fully-outside items
// are invisible. Enable infiniteScroll to grow the window as the user scrolls.

const OOW_TRACKS = [
  { id: "oow-a", title: "Straddles left" },
  { id: "oow-b", title: "Straddles right" },
  { id: "oow-c", title: "Fully outside left" },
  { id: "oow-d", title: "Fully outside right" },
  { id: "oow-e", title: "Fully inside (ref)" },
];

const OOW_START = new Date(2026, 0, 10); // Jan 10
const OOW_END = new Date(2026, 0, 25); // Jan 25

const OOW_ITEMS: TimelineItem<TaskData>[] = [
  // Straddles left boundary (start before window)
  {
    id: "oo1",
    trackId: "oow-a",
    start: new Date(2026, 0, 5),
    end: new Date(2026, 0, 15),
    label: "Starts before window",
    data: { priority: "high", assignee: "Alice" },
  },
  // Straddles right boundary (end after window)
  {
    id: "oo2",
    trackId: "oow-b",
    start: new Date(2026, 0, 20),
    end: new Date(2026, 0, 30),
    label: "Ends after window",
    data: { priority: "medium", assignee: "Bob" },
  },
  // Entirely before window
  {
    id: "oo3",
    trackId: "oow-c",
    start: new Date(2025, 11, 28),
    end: new Date(2026, 0, 5),
    label: "Entirely before",
    data: { priority: "low", assignee: "Carol" },
  },
  // Entirely after window
  {
    id: "oo4",
    trackId: "oow-d",
    start: new Date(2026, 0, 28),
    end: new Date(2026, 1, 5),
    label: "Entirely after",
    data: { priority: "low", assignee: "Dave" },
  },
  // Normal item — inside window for comparison
  {
    id: "oo5",
    trackId: "oow-e",
    start: new Date(2026, 0, 12),
    end: new Date(2026, 0, 22),
    label: "Normal item",
    data: { priority: "high", assignee: "Eve" },
  },
];

export const OutOfWindowItems: Story = {
  render: () => {
    const timeline = useTimeline<TaskData>({
      tracks: OOW_TRACKS,
      items: OOW_ITEMS,
      startDate: OOW_START,
      endDate: OOW_END,
      view: "day",
      dayWidth: 40,
    });

    return (
      <div className="p-6 flex flex-col gap-3 bg-gray-50 min-h-screen font-sans">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Out-of-window items (fixed range, no infinite scroll)
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Window is Jan 10–25. Items that straddle a boundary show only their
            in-window portion; items fully outside the range are not rendered.
            Enable <code>infiniteScroll</code> to let the window grow as the
            user scrolls toward hidden items.
          </p>
        </div>
        {/* w-fit + self-start shrink-wrap the border to the content width */}
        <div className="w-fit self-start">
          <Timeline {...timeline.getTimelineProps()} />
        </div>
      </div>
    );
  },
};

// ─── Story 12: Zoom levels — day width from very dense to very spacious ───────
//
// Edge case: extreme dayWidth values. At 4 px/day bars are barely visible;
// at 120 px/day the header top row can run out of horizontal space for labels.
// The timeline should not crash or mis-render at either extreme.

const ZOOM_LEVELS: Array<{ label: string; dayWidth: number; view: ViewMode }> =
  [
    { label: "4 px / day", dayWidth: 4, view: "day" },
    { label: "12 px / day", dayWidth: 12, view: "day" },
    { label: "36 px / day (def.)", dayWidth: 36, view: "day" },
    { label: "80 px / day", dayWidth: 80, view: "day" },
    { label: "120 px / day", dayWidth: 120, view: "day" },
    { label: "Month view", dayWidth: 36, view: "month" },
  ];

export const ZoomLevels: Story = {
  render: () => {
    const [zoomIdx, setZoomIdx] = useState(2);
    const { dayWidth, view } = ZOOM_LEVELS[zoomIdx];

    const timeline = useTimeline<TaskData>({
      tracks: TRACKS,
      items: ITEMS,
      startDate: START_DATE,
      endDate: END_DATE,
      view,
      dayWidth,
    });

    return (
      <div className="p-6 flex flex-col gap-4 bg-gray-50 min-h-screen font-sans">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-semibold text-gray-800 mr-2">
            Zoom levels
          </h1>
          {ZOOM_LEVELS.map((z, i) => (
            <button
              key={i}
              onClick={() => setZoomIdx(i)}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                i === zoomIdx
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 -mt-2">
          Current: <strong>{dayWidth} px/day</strong> — {view} view
        </p>
        <Timeline {...timeline.getTimelineProps()} />
      </div>
    );
  },
};

// ─── Story 13: Cross-year span — December 2025 → February 2026 ───────────────
//
// Edge case: the date range straddles a year boundary. The top row in day/week
// view shows "MMMM yyyy" per month, so "December 2025", "January 2026", and
// "February 2026" should all appear. In month view the top row shows years.

const XMAS_TRACKS = [
  { id: "xmas-a", title: "Cross-year task" },
  { id: "xmas-b", title: "Dec only" },
  { id: "xmas-c", title: "Jan only" },
  { id: "xmas-d", title: "Feb only" },
];

const XMAS_ITEMS: TimelineItem<TaskData>[] = [
  {
    id: "x1",
    trackId: "xmas-a",
    start: new Date(2025, 11, 20),
    end: new Date(2026, 0, 10),
    label: "Year-spanning task",
    data: { priority: "high", assignee: "Alice" },
  },
  {
    id: "x2",
    trackId: "xmas-b",
    start: new Date(2025, 11, 1),
    end: new Date(2025, 11, 18),
    label: "Q4 wrap-up",
    data: { priority: "medium", assignee: "Bob" },
  },
  {
    id: "x3",
    trackId: "xmas-b",
    start: new Date(2025, 11, 26),
    end: new Date(2025, 11, 31),
    label: "Holiday prep",
    data: { priority: "low", assignee: "Carol" },
  },
  {
    id: "x4",
    trackId: "xmas-c",
    start: new Date(2026, 0, 5),
    end: new Date(2026, 0, 20),
    label: "New year sprint",
    data: { priority: "high", assignee: "Dave" },
  },
  {
    id: "x5",
    trackId: "xmas-d",
    start: new Date(2026, 1, 2),
    end: new Date(2026, 1, 20),
    label: "Feb deliverable",
    data: { priority: "medium", assignee: "Eve" },
  },
];

export const CrossYearSpan: Story = {
  render: () => {
    const [view, setView] = useState<ViewMode>("day");
    const dayWidth = view === "day" ? 28 : view === "week" ? 18 : 40;

    const timeline = useTimeline<TaskData>({
      tracks: XMAS_TRACKS,
      items: XMAS_ITEMS,
      startDate: new Date(2025, 11, 1),
      endDate: new Date(2026, 1, 28),
      view,
      dayWidth,
    });

    const VIEWS: ViewMode[] = ["day", "week", "month"];

    return (
      <div className="p-6 flex flex-col gap-4 bg-gray-50 min-h-screen font-sans">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Cross-year span — Dec 2025 → Feb 2026
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              The header top row must show "December 2025", "January 2026", and
              "February 2026" in day/week view — and both years in month view.
            </p>
          </div>
          <div className="flex h-8 rounded-md border border-gray-300 overflow-hidden shrink-0">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-sm capitalize transition-colors ${
                  view === v
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <Timeline {...timeline.getTimelineProps()} />
      </div>
    );
  },
};

// ─── Story 14: Programmatic date change — "jump to date" with infinite scroll ─
//
// Edge case: the consumer changes startDate / endDate props after mount (e.g.
// "jump to today" or a date-picker navigation). For non-infinite-scroll this
// works automatically. For infinite-scroll, Timeline detects the prop change
// in its layout effect and re-anchors the scroll position to the new range.

const QUARTERS: Array<{ label: string; start: Date; end: Date }> = [
  { label: "Q1 2026", start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) },
  { label: "Q2 2026", start: new Date(2026, 3, 1), end: new Date(2026, 5, 30) },
  { label: "Q3 2026", start: new Date(2026, 6, 1), end: new Date(2026, 8, 30) },
  {
    label: "Q4 2026",
    start: new Date(2026, 9, 1),
    end: new Date(2026, 11, 31),
  },
];

const JUMP_ITEMS: TimelineItem<TaskData>[] = [
  {
    id: "j1",
    trackId: "design",
    start: new Date(2026, 0, 5),
    end: new Date(2026, 0, 20),
    label: "Q1 — Design",
    data: { priority: "high", assignee: "Alice" },
  },
  {
    id: "j2",
    trackId: "frontend",
    start: new Date(2026, 0, 12),
    end: new Date(2026, 0, 28),
    label: "Q1 — Frontend",
    data: { priority: "medium", assignee: "Bob" },
  },
  {
    id: "j3",
    trackId: "backend",
    start: new Date(2026, 1, 5),
    end: new Date(2026, 2, 15),
    label: "Q1 — Backend",
    data: { priority: "high", assignee: "Dave" },
  },
  {
    id: "j4",
    trackId: "design",
    start: new Date(2026, 3, 3),
    end: new Date(2026, 3, 24),
    label: "Q2 — Design",
    data: { priority: "medium", assignee: "Alice" },
  },
  {
    id: "j5",
    trackId: "frontend",
    start: new Date(2026, 4, 1),
    end: new Date(2026, 4, 20),
    label: "Q2 — Frontend",
    data: { priority: "high", assignee: "Carol" },
  },
  {
    id: "j6",
    trackId: "backend",
    start: new Date(2026, 4, 10),
    end: new Date(2026, 5, 5),
    label: "Q2 — Backend",
    data: { priority: "low", assignee: "Dave" },
  },
  {
    id: "j7",
    trackId: "design",
    start: new Date(2026, 6, 7),
    end: new Date(2026, 6, 25),
    label: "Q3 — Design",
    data: { priority: "high", assignee: "Alice" },
  },
  {
    id: "j8",
    trackId: "frontend",
    start: new Date(2026, 7, 1),
    end: new Date(2026, 7, 22),
    label: "Q3 — Frontend",
    data: { priority: "medium", assignee: "Bob" },
  },
  {
    id: "j9",
    trackId: "backend",
    start: new Date(2026, 7, 15),
    end: new Date(2026, 8, 10),
    label: "Q3 — Backend",
    data: { priority: "high", assignee: "Eve" },
  },
  {
    id: "j10",
    trackId: "design",
    start: new Date(2026, 9, 5),
    end: new Date(2026, 9, 22),
    label: "Q4 — Design",
    data: { priority: "low", assignee: "Alice" },
  },
  {
    id: "j11",
    trackId: "frontend",
    start: new Date(2026, 10, 3),
    end: new Date(2026, 10, 18),
    label: "Q4 — Frontend",
    data: { priority: "medium", assignee: "Carol" },
  },
  {
    id: "j12",
    trackId: "backend",
    start: new Date(2026, 10, 12),
    end: new Date(2026, 11, 5),
    label: "Q4 — Backend",
    data: { priority: "high", assignee: "Dave" },
  },
];

export const ProgrammaticDateChange: Story = {
  render: () => {
    const [quarterIdx, setQuarterIdx] = useState(0);
    const { start, end } = QUARTERS[quarterIdx];

    const timeline = useTimeline<TaskData>({
      tracks: TRACKS.slice(0, 3), // design, frontend, backend
      items: JUMP_ITEMS,
      startDate: start,
      endDate: end,
      view: "day",
      dayWidth: 24,
      infiniteScroll: true,
    });

    return (
      <div className="p-6 flex flex-col gap-4 bg-gray-50 min-h-screen font-sans">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Programmatic date change with infinite scroll
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Clicking a quarter resets <code>startDate</code> /{" "}
            <code>endDate</code> props while <code>infiniteScroll</code> is
            active. The internal window and scroll position reset to the new
            range.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {QUARTERS.map((q, i) => (
            <button
              key={q.label}
              onClick={() => setQuarterIdx(i)}
              className={`px-4 py-1.5 text-sm rounded-md border font-medium transition-colors ${
                i === quarterIdx
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
        <div className="h-64">
          <Timeline {...timeline.getTimelineProps()} />
        </div>
      </div>
    );
  },
};
