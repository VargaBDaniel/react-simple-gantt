import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
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
