import { FormEvent, useEffect, useState } from "react";
import Modal from "./Modal";
import { Asset, Employee } from "../types";
import * as employeeService from "../services/employees";
import * as assetService from "../services/assets";
import { getErrorMessage } from "../services/api";
import { useToast } from "../hooks/useToast";

interface AssignAssetModalProps {
  asset: Asset;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignAssetModal({ asset, onClose, onSuccess }: AssignAssetModalProps) {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    employeeService.listEmployees().then(setEmployees).catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!employeeId) {
      setError("Please select an employee");
      return;
    }
    if (!expectedReturnDate) {
      setError("Expected return date is required");
      return;
    }
    if (expectedReturnDate < assignmentDate) {
      setError("Expected return date cannot be before assignment date");
      return;
    }

    setSubmitting(true);
    try {
      await assetService.assignAsset(asset.id, {
        employeeId,
        assignmentDate,
        expectedReturnDate,
        notes: notes || undefined,
      });
      showToast("Asset assigned successfully");
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Assign Asset" subtitle={`${asset.name} · ${asset.assetTag}`}>
      <form onSubmit={handleSubmit}>
        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <label className="mb-1 block text-sm font-medium text-slate-700">Employee</label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          <option value="">Select employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} — {emp.department}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-medium text-slate-700">Assignment Date</label>
        <input
          type="date"
          value={assignmentDate}
          onChange={(e) => setAssignmentDate(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Expected Return Date</label>
        <input
          type="date"
          value={expectedReturnDate}
          onChange={(e) => setExpectedReturnDate(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />

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
            {submitting ? "Assigning…" : "Assign Asset"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
