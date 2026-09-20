import clsx from "clsx";
import type { ProjectStatus } from "@/lib/types";

export interface StatusBadgeProps {
  status: ProjectStatus;
}

const LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  archived: "Archived",
  "in-progress": "In progress",
};

/** Project status pill; modifier class mirrors the status value. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={clsx("status-badge", `status-badge--${status}`)}>{LABELS[status]}</span>;
}
