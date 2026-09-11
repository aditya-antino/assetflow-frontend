import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">404</h1>
      <p className="mt-2 text-sm text-slate-500">This page doesn't exist.</p>
      <Link to="/dashboard" className="mt-4 text-sm font-medium text-slate-900 hover:underline">
        Go to Dashboard
      </Link>
    </div>
  );
}
