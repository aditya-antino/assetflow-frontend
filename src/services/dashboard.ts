import { api } from "./api";
import { ApiResponse, Asset, AssetEvent, DashboardSummary } from "../types";

export async function getSummary() {
  const res = await api.get<ApiResponse<DashboardSummary>>("/dashboard");
  return res.data.data;
}

export async function getRecentActivity() {
  const res = await api.get<ApiResponse<AssetEvent[]>>("/dashboard/recent-activity");
  return res.data.data;
}

export async function getUpcomingReturns() {
  const res = await api.get<ApiResponse<Asset[]>>("/dashboard/upcoming-returns");
  return res.data.data;
}
