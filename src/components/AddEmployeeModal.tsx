import { FormEvent, useState } from "react";
import Modal from "./Modal";
import * as employeeService from "../services/employees";
import { getErrorMessage } from "../services/api";
import { useToast } from "../hooks/useToast";

interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({ onClose, onSuccess }: AddEmployeeModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EMPLOYEE">("EMPLOYEE");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await employeeService.createEmployee({
        name,
        email,
        employeeId,
        department: department || undefined,
        role,
      });
      showToast(
        created.temporaryPassword
          ? `Employee added. Temporary password: ${created.temporaryPassword}`
          : "Employee added successfully"
      );
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

  return (
    <Modal open onClose={onClose} title="Add Employee">
      <form onSubmit={handleSubmit}>
        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={`mb-4 ${inputCls}`} />

        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mb-4 ${inputCls}`}
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Employee ID</label>
        <input
          required
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className={`mb-4 ${inputCls}`}
          placeholder="EMP-011"
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
        <input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className={`mb-4 ${inputCls}`}
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "EMPLOYEE")} className={`mb-6 ${inputCls}`}>
          <option value="EMPLOYEE">Employee</option>
          <option value="ADMIN">Admin</option>
        </select>

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
            {submitting ? "Adding…" : "Add Employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
