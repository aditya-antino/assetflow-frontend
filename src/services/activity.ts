import { api } from "./api";
import { AssetEvent, PaginatedResponse } from "../types";

export async function listActivity(page = 1, limit = 50) {
  const res = await api.get<PaginatedResponse<AssetEvent>>("/activity", {
    params: { page, limit },
  });
  return res.data;
}
