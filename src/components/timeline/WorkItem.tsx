import type { RenderItemProps, TimelineItem } from "../../types/timeline.types";

interface WorkItemProps<TData = unknown> {
  item: TimelineItem<TData>;
  left: number;
  width: number;
  /** Explicit top offset in px, provided when itemStagger > 0. When absent the
   *  item is centred via Tailwind's top-1/2 / -translate-y-1/2 classes. */
  top?: number;
  /** Explicit item bar height in px, companion to `top`. */
  itemH?: number;
  isSelected: boolean;
  isHovered: boolean;
  renderItem?: (props: RenderItemProps<TData>) => React.ReactNode;
  onClick: (item: TimelineItem<TData>) => void;
  onMouseEnter: (item: TimelineItem<TData>) => void;
  onMouseLeave: () => void;
}

export function WorkItem<TData = unknown>({
  item,
  left,
  width,
  top,
  itemH,
  isSelected,
  isHovered,
  renderItem,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: WorkItemProps<TData>) {
  // When top/itemH are provided (itemStagger > 0) use explicit pixel positioning.
  // Otherwise keep the original centered layout (top-1/2 -translate-y-1/2 h-[60%]).
  const positionClasses =
    top !== undefined
      ? "absolute rounded cursor-pointer select-none overflow-hidden transition-shadow"
      : "absolute top-1/2 -translate-y-1/2 h-[60%] rounded cursor-pointer select-none overflow-hidden transition-shadow";

  // Keep WorkItems in z-[1..2] — well below sticky labels (z-10) and header (z-20)
  const stateClasses = isSelected
    ? "ring-2 ring-offset-1 ring-blue-500 bg-blue-500 z-[2]"
    : isHovered
      ? "bg-blue-400 z-[1] shadow-md"
      : "bg-blue-300 z-0";

  return (
    <div
      className={`${positionClasses} ${stateClasses}`}
      style={{
        left,
        width,
        ...(top !== undefined ? { top, height: itemH } : {}),
      }}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={(e) => {
        e.stopPropagation();
        onClick(item);
      }}
      onMouseEnter={() => onMouseEnter(item)}
      onMouseLeave={() => onMouseLeave()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(item);
      }}
    >
      {renderItem ? (
        renderItem({ item, isSelected, isHovered })
      ) : (
        <span className="px-2 py-0.5 text-xs text-white font-medium truncate leading-full h-full flex items-center">
          {item.label ?? item.id}
        </span>
      )}
    </div>
  );
}
