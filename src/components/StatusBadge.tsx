import { AssetStatus, UserStatus } from "../types";

const styles: Record<string, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  ASSIGNED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  UNDER_REPAIR: "bg-amber-50 text-amber-700 ring-amber-600/20",
  RETIRED: "bg-slate-100 text-slate-500 ring-slate-500/20",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  INACTIVE: "bg-slate-100 text-slate-500 ring-slate-500/20",
};

const labels: Record<string, string> = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  UNDER_REPAIR: "Under Repair",
  RETIRED: "Retired",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export default function StatusBadge({ status }: { status: AssetStatus | UserStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
