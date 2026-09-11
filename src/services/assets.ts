import { api } from "./api";
import { ApiResponse, Asset, AssetEvent, PaginatedResponse } from "../types";

export interface ListAssetsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

export async function listAssets(params: ListAssetsParams) {
  const res = await api.get<PaginatedResponse<Asset>>("/assets", { params });
  return res.data;
}

export async function getAsset(id: string) {
  const res = await api.get<ApiResponse<Asset>>(`/assets/${id}`);
  return res.data.data;
}

export async function getAssetHistory(id: string) {
  const res = await api.get<ApiResponse<AssetEvent[]>>(`/assets/${id}/history`);
  return res.data.data;
}

export interface CreateAssetInput {
  assetTag: string;
  name: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  location?: string;
  description?: string;
}

export async function createAsset(input: CreateAssetInput) {
  const res = await api.post<ApiResponse<Asset>>("/assets", input);
  return res.data.data;
}

export interface BulkCreateAssetInput {
  name: string;
  category: string;
  manufacturer?: string;
  model?: string;
  quantity: number;
  assetTagPrefix: string;
  startingNumber?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  location?: string;
  description?: string;
}

export async function bulkCreateAssets(input: BulkCreateAssetInput) {
  const res = await api.post<ApiResponse<Asset[]>>("/assets/bulk", input);
  return res.data.data;
}

export async function previewImportAssets(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<
    ApiResponse<{ rows: Record<string, string>[]; errors: { row: number; message: string }[]; valid: boolean }>
  >("/assets/import?mode=preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function importAssets(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<ApiResponse<Asset[]>>("/assets/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export interface AssignAssetInput {
  employeeId: string;
  assignmentDate?: string;
  expectedReturnDate: string;
  notes?: string;
}

export async function assignAsset(id: string, input: AssignAssetInput) {
  const res = await api.post<ApiResponse<Asset>>(`/assets/${id}/assign`, input);
  return res.data.data;
}

export interface ReturnAssetInput {
  returnDate?: string;
  condition: "GOOD" | "DAMAGED" | "NEEDS_REPAIR";
  notes?: string;
}

export async function returnAsset(id: string, input: ReturnAssetInput) {
  const res = await api.post<ApiResponse<Asset>>(`/assets/${id}/return`, input);
  return res.data.data;
}

export async function startRepair(id: string) {
  const res = await api.post<ApiResponse<Asset>>(`/assets/${id}/repair/start`);
  return res.data.data;
}

export async function completeRepair(id: string) {
  const res = await api.post<ApiResponse<Asset>>(`/assets/${id}/repair/complete`);
  return res.data.data;
}

export async function retireAsset(id: string) {
  const res = await api.post<ApiResponse<Asset>>(`/assets/${id}/retire`);
  return res.data.data;
}
