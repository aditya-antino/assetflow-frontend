import { FormEvent, useState } from "react";
import Modal from "./Modal";
import { Asset } from "../types";
import * as assetService from "../services/assets";
import { getErrorMessage } from "../services/api";
import { useToast } from "../hooks/useToast";

interface ReturnAssetModalProps {
  asset: Asset;
  onClose: () => void;
  onSuccess: () => void;
}

const conditions = [
  { value: "GOOD", label: "Good", hint: "Asset becomes Available" },
  { value: "DAMAGED", label: "Damaged", hint: "Asset moves to Under Repair" },
  { value: "NEEDS_REPAIR", label: "Needs Repair", hint: "Asset moves to Under Repair" },
] as const;

export default function ReturnAssetModal({ asset, onClose, onSuccess }: ReturnAssetModalProps) {
  const { showToast } = useToast();
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [condition, setCondition] = useState<"GOOD" | "DAMAGED" | "NEEDS_REPAIR">("GOOD");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const updated = await assetService.returnAsset(asset.id, {
        returnDate,
        condition,
        notes: notes || undefined,
      });
      showToast(
        condition === "GOOD"
          ? "Asset returned and marked Available"
          : "Asset returned and moved to Under Repair"
      );
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Return Asset"
      subtitle={`Currently assigned to ${asset.currentAssignee?.name ?? "—"}`}
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <label className="mb-1 block text-sm font-medium text-slate-700">Return Date</label>
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />

        <label className="mb-2 block text-sm font-medium text-slate-700">Condition</label>
        <div className="mb-4 space-y-2">
          {conditions.map((c) => (
            <label
              key={c.value}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                condition === c.value ? "border-slate-900 bg-slate-50" : "border-slate-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="condition"
                  checked={condition === c.value}
                  onChange={() => setCondition(c.value)}
                />
                {c.label}
              </span>
              <span className="text-xs text-slate-400">{c.hint}</span>
            </label>
          ))}
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mb-6 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Returning…" : "Return Asset"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
