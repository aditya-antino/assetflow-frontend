import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, CheckCircle2, UserCheck, Wrench, Archive } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import * as dashboardService from "../services/dashboard";
import { Asset, AssetEvent, DashboardSummary } from "../types";
import Spinner from "../components/Spinner";
import { dueLabel, formatDate, timeAgo } from "../utils/format";
import { describeEvent } from "../utils/eventText";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<AssetEvent[]>([]);
  const [upcoming, setUpcoming] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getSummary(),
      dashboardService.getRecentActivity(),
      dashboardService.getUpcomingReturns(),
    ])
      .then(([s, a, u]) => {
        setSummary(s);
        setActivity(a);
        setUpcoming(u);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;

  const kpis = [
    { label: "Total Assets", value: summary?.total ?? 0, icon: Boxes, color: "text-slate-900" },
    { label: "Available", value: summary?.available ?? 0, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Assigned", value: summary?.assigned ?? 0, icon: UserCheck, color: "text-blue-600" },
    { label: "Under Repair", value: summary?.underRepair ?? 0, icon: Wrench, color: "text-amber-600" },
    { label: "Retired", value: summary?.retired ?? 0, icon: Archive, color: "text-slate-500" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          {greeting()}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your organization's assets.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No activity yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {activity.map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-slate-700">{describeEvent(event)}</span>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(event.eventDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Upcoming Returns</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No upcoming returns.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400">
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Asset</th>
                    <th className="pb-2 font-medium">Due Date</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((asset) => (
                    <tr key={asset.id} className="border-t border-slate-100">
                      <td className="py-2 text-slate-700">{asset.currentAssignee?.name ?? "—"}</td>
                      <td className="py-2">
                        <Link to={`/assets/${asset.id}`} className="text-slate-900 hover:underline">
                          {asset.assetTag}
                        </Link>
                      </td>
                      <td className="py-2 text-slate-500">{formatDate(asset.expectedReturnDate)}</td>
                      <td className="py-2 text-slate-500">{dueLabel(asset.expectedReturnDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
