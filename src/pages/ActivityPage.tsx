import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity as ActivityIcon } from "lucide-react";
import * as activityService from "../services/activity";
import { AssetEvent } from "../types";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { formatDateTime } from "../utils/format";
import { eventTitle } from "../utils/eventText";

function groupByDay(events: AssetEvent[]): Record<string, AssetEvent[]> {
  const groups: Record<string, AssetEvent[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const event of events) {
    const eventDay = new Date(event.eventDate).toDateString();
    let label: string;
    if (eventDay === today) label = "Today";
    else if (eventDay === yesterday) label = "Yesterday";
    else
      label = new Date(event.eventDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

    if (!groups[label]) groups[label] = [];
    groups[label].push(event);
  }
  return groups;
}

export default function ActivityPage() {
  const [events, setEvents] = useState<AssetEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activityService
      .listActivity(1, 100)
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const groups = groupByDay(events);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Activity</h1>
        <p className="mt-1 text-sm text-slate-500">Organization-wide audit trail of every asset event.</p>
      </div>

      {loading ? (
        <Spinner label="Loading activity…" />
      ) : events.length === 0 ? (
        <EmptyState icon={ActivityIcon} title="No activity yet" description="Asset events will appear here as they happen." />
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([label, dayEvents]) => (
            <div key={label}>
              <h2 className="mb-3 text-sm font-semibold text-slate-500">{label}</h2>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <ul className="divide-y divide-slate-100">
                  {dayEvents.map((event) => (
                    <li key={event.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">
                          {event.performedBy?.name ?? event.toUser?.name ?? event.fromUser?.name ?? "System"}
                        </p>
                        <p className="text-slate-500">
                          {eventTitle(event)} ·{" "}
                          <Link to={`/assets/${event.assetId}`} className="hover:underline">
                            {event.asset?.assetTag}
                          </Link>
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">{formatDateTime(event.eventDate)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
