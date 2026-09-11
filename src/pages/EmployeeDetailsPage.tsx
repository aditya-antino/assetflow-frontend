import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as employeeService from "../services/employees";
import { Employee } from "../types";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/format";

export default function EmployeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    employeeService
      .getEmployee(id)
      .then(setEmployee)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading employee…" />;
  if (!employee) return null;

  return (
    <div>
      <Link to="/employees" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{employee.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {employee.department} · {employee.employeeId}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{employee.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium text-slate-900">{employee.role}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <StatusBadge status={employee.status} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Assigned Assets</h2>
          {!employee.assignedAssets || employee.assignedAssets.length === 0 ? (
            <p className="text-sm text-slate-400">No assets currently assigned.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {employee.assignedAssets.map((asset) => (
                <li key={asset.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link to={`/assets/${asset.id}`} className="text-sm font-medium text-slate-900 hover:underline">
                      {asset.assetTag}
                    </Link>
                    <p className="text-xs text-slate-500">{asset.name}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Expected return {formatDate(asset.expectedReturnDate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
