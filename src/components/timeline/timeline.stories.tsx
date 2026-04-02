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
  // Entirely outside the initial window — only appears after right expansion
  {
    id: "b3",
    trackId: "qa",
    start: new Date(2026, 1, 1),
    end: new Date(2026, 1, 10),
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
            Initial window is Jan 10–20. "Spanning task" straddles the right
            edge. Scroll right to reveal "Future task", scroll left to reveal
            "Pre-window task". Items should appear without positional jumps.
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
