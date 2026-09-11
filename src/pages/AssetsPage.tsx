import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Boxes } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import * as assetService from "../services/assets";
import { Asset } from "../types";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import AddAssetsModal from "../components/AddAssetsModal";
import Select from "../components/Select";
import { formatDate, formatStatusLabel } from "../utils/format";

const STATUSES = ["AVAILABLE", "ASSIGNED", "UNDER_REPAIR", "RETIRED"];
const CATEGORIES = ["Laptop", "Monitor", "Phone", "Tablet", "Accessory", "Other"];
const LIMIT = 20;

export default function AssetsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchAssets = useCallback(() => {
    setLoading(true);
    assetService
      .listAssets({ page, limit: LIMIT, search: search || undefined, status: status || undefined, category: category || undefined })
      .then((res) => {
        setAssets(res.data);
        setTotal(res.pagination.total);
      })
      .finally(() => setLoading(false));
  }, [page, search, status, category]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    setPage(1);
  }, [search, status, category]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{isAdmin ? "Assets" : "My Assets"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin ? "Manage and track all physical assets." : "Assets currently assigned to you."}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add Assets
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets…"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatStatusLabel(s)}
              </option>
            ))}
          </Select>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      )}

      {loading ? (
        <Spinner label="Loading assets…" />
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No assets found"
          description="Try changing your filters or add your first asset."
          action={
            isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add Assets
              </button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Asset Tag</th>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Current Holder</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-4 py-3">Expected Return</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((asset) => (
                  <tr key={asset.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold tracking-wide text-slate-700">
                        {asset.assetTag}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-900">{asset.name}</p>
                      {(asset.manufacturer || asset.model) && (
                        <p className="text-xs text-slate-400">
                          {[asset.manufacturer, asset.model].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {asset.currentAssignee ? (
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                            {asset.currentAssignee.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-slate-700">{asset.currentAssignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(asset.purchaseDate ?? asset.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {asset.expectedReturnDate ? formatDate(asset.expectedReturnDate) : "N/A"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/assets/${asset.id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <span>
              Page {page} of {totalPages} · {total} assets
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddAssetsModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAssets();
          }}
        />
      )}
    </div>
  );
}
