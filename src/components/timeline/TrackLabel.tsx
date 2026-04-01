import type { ReactNode } from "react";

interface TrackLabelProps {
  title: string | ReactNode;
  className?: string;
}

export function TrackLabel({ title, className = "" }: TrackLabelProps) {
  return (
    <div
      className={`flex items-center px-3 border-b border-r border-gray-200 bg-white min-h-12 ${className}`}
    >
      <span className="text-sm font-medium text-gray-700 truncate">
        {title}
      </span>
    </div>
  );
}
