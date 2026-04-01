import { useState } from "react";
import { Timeline } from "./components/timeline/Timeline";
import { useTimeline } from "./hooks/useTimeline";
import type { ViewMode } from "./types/timeline.types";

const tracks = [
  { id: "t1", title: "Design" },
  { id: "t2", title: "Frontend" },
  { id: "t3", title: "Backend" },
  { id: "t4", title: "QA" },
  { id: "t5", title: "DevOps" },
];

const items = [
  {
    id: "i1",
    trackId: "t1",
    start: new Date(2026, 0, 5),
    end: new Date(2026, 0, 12),
    label: "Wireframes",
  },
  {
    id: "i2",
    trackId: "t1",
    start: new Date(2026, 0, 14),
    end: new Date(2026, 0, 20),
    label: "Mockups",
  },
  {
    id: "i3",
    trackId: "t2",
    start: new Date(2026, 0, 8),
    end: new Date(2026, 0, 22),
    label: "Component library",
  },
  {
    id: "i4",
    trackId: "t2",
    start: new Date(2026, 0, 23),
    end: new Date(2026, 1, 5),
    label: "Integration",
  },
  {
    id: "i5",
    trackId: "t3",
    start: new Date(2026, 0, 10),
    end: new Date(2026, 0, 28),
    label: "API development",
  },
  {
    id: "i6",
    trackId: "t3",
    start: new Date(2026, 1, 1),
    end: new Date(2026, 1, 15),
    label: "Auth service",
  },
  {
    id: "i7",
    trackId: "t4",
    start: new Date(2026, 0, 25),
    end: new Date(2026, 1, 10),
    label: "Testing",
  },
  {
    id: "i8",
    trackId: "t5",
    start: new Date(2026, 0, 15),
    end: new Date(2026, 0, 20),
    label: "CI pipeline",
  },
];

const VIEW_OPTIONS: ViewMode[] = ["day", "week", "month"];

function App() {
  const [view, setView] = useState<ViewMode>("day");
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const timeline = useTimeline({
    tracks,
    items,
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 2, 31),
    view,
    dayWidth: view === "day" ? 40 : view === "week" ? 20 : 10,
    onItemClick: (item) => setLastClicked(item.label ?? item.id),
  });

  return (
    <div className="p-6 flex flex-col gap-4 min-h-screen bg-gray-50">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">
          react-simple-gantt
        </h1>
        <div className="flex gap-1">
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-sm rounded border ${
                view === v
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {lastClicked && (
          <span className="text-sm text-gray-500">
            Last clicked: <strong>{lastClicked}</strong>
          </span>
        )}
      </div>

      <Timeline {...timeline.getTimelineProps()} />
    </div>
  );
}

export default App;
