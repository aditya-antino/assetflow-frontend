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

const PAGE_SIZE = 100;

export default function ActivityPage() {
  const [events, setEvents] = useState<AssetEvent[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    activityService
      .listActivity(1, PAGE_SIZE)
      .then((res) => {
        setEvents(res.data);
        setTotal(res.pagination.total);
      })
      .finally(() => setLoading(false));
  }, []);

  function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    activityService
      .listActivity(nextPage, PAGE_SIZE)
      .then((res) => {
        setEvents((prev) => [...prev, ...res.data]);
        setTotal(res.pagination.total);
        setPage(nextPage);
      })
      .finally(() => setLoadingMore(false));
  }

  const groups = groupByDay(events);
  const hasMore = events.length < total;

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
                        {event.notes && <p className="mt-0.5 text-xs text-slate-400">{event.notes}</p>}
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">{formatDateTime(event.eventDate)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : `Load more (${total - events.length} remaining)`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
