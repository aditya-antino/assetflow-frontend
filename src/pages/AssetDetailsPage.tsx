import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Wrench, CheckCircle2, Archive } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import * as assetService from "../services/assets";
import { getErrorMessage } from "../services/api";
import { Asset, AssetEvent } from "../types";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import AssignAssetModal from "../components/AssignAssetModal";
import ReturnAssetModal from "../components/ReturnAssetModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import { eventTitle } from "../utils/eventText";

export default function AssetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "ADMIN";

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"retire" | "repairStart" | "repairComplete" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [assetData, historyData] = await Promise.all([
        assetService.getAsset(id),
        assetService.getAssetHistory(id),
      ]);
      setAsset(assetData);
      setHistory(historyData);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
      navigate("/assets");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleConfirmedAction() {
    if (!asset || !confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction === "retire") {
        await assetService.retireAsset(asset.id);
        showToast("Asset retired");
      } else if (confirmAction === "repairStart") {
        await assetService.startRepair(asset.id);
        showToast("Asset moved to repair");
      } else if (confirmAction === "repairComplete") {
        await assetService.completeRepair(asset.id);
        showToast("Repair completed, asset is now Available");
      }
      setConfirmAction(null);
      fetchAll();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <Spinner label="Loading asset…" />;
  if (!asset) return null;

  return (
    <div>
      <Link to="/assets" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        Back to Assets
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{asset.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{asset.assetTag}</p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            {asset.status === "AVAILABLE" && (
              <>
                <button
                  onClick={() => setShowAssign(true)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Assign Asset
                </button>
                <button
                  onClick={() => setConfirmAction("repairStart")}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Wrench className="h-4 w-4" />
                  Start Repair
                </button>
                <button
                  onClick={() => setConfirmAction("retire")}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Archive className="h-4 w-4" />
                  Retire
                </button>
              </>
            )}
            {asset.status === "ASSIGNED" && (
              <button
                onClick={() => setShowReturn(true)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Return Asset
              </button>
            )}
            {asset.status === "UNDER_REPAIR" && (
              <>
                <button
                  onClick={() => setConfirmAction("repairComplete")}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Repair
                </button>
                <button
                  onClick={() => setConfirmAction("retire")}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Archive className="h-4 w-4" />
                  Retire
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Details</h2>
          <dl className="space-y-3 text-sm">
            <Detail label="Status" value={<StatusBadge status={asset.status} />} />
            <Detail label="Current Holder" value={asset.currentAssignee?.name ?? "—"} />
            <Detail label="Category" value={asset.category} />
            <Detail label="Manufacturer" value={asset.manufacturer ?? "—"} />
            <Detail label="Model" value={asset.model ?? "—"} />
            <Detail label="Serial Number" value={asset.serialNumber ?? "—"} />
            <Detail label="Location" value={asset.location ?? "—"} />
            <Detail label="Purchase Date" value={formatDate(asset.purchaseDate)} />
            <Detail label="Purchase Price" value={formatCurrency(asset.purchasePrice)} />
            <Detail label="Expected Return" value={formatDate(asset.expectedReturnDate)} />
            {asset.description && <Detail label="Description" value={asset.description} />}
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Asset History</h2>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">No history recorded yet.</p>
          ) : (
            <ol className="relative border-l border-slate-200 pl-6">
              {history.map((event) => (
                <li key={event.id} className="mb-6 last:mb-0">
                  <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-900" />
                  <p className="text-xs text-slate-400">{formatDateTime(event.eventDate)}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">{eventTitle(event)}</p>
                  {event.expectedReturnDate && event.eventType === "ASSIGNED" && (
                    <p className="text-xs text-slate-500">
                      Expected return: {formatDate(event.expectedReturnDate)}
                    </p>
                  )}
                  {event.condition && (
                    <p className="text-xs text-slate-500">Condition: {event.condition.replace("_", " ")}</p>
                  )}
                  {event.notes && <p className="mt-1 text-xs text-slate-500">{event.notes}</p>}
                  {event.performedBy?.name && (
                    <p className="mt-1 text-xs text-slate-400">By {event.performedBy.name}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {showAssign && (
        <AssignAssetModal
          asset={asset}
          onClose={() => setShowAssign(false)}
          onSuccess={() => {
            setShowAssign(false);
            fetchAll();
          }}
        />
      )}

      {showReturn && (
        <ReturnAssetModal
          asset={asset}
          onClose={() => setShowReturn(false)}
          onSuccess={() => {
            setShowReturn(false);
            fetchAll();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmAction === "retire"}
        title={`Retire ${asset.assetTag}?`}
        description="This asset will no longer be available for assignment."
        confirmLabel="Retire Asset"
        danger
        loading={actionLoading}
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "repairStart"}
        title={`Start repair for ${asset.assetTag}?`}
        description="The asset will move to Under Repair status."
        confirmLabel="Start Repair"
        loading={actionLoading}
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "repairComplete"}
        title={`Complete repair for ${asset.assetTag}?`}
        description="The asset will move back to Available status."
        confirmLabel="Complete Repair"
        loading={actionLoading}
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
