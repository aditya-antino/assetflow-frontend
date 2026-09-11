export type UserRole = "ADMIN" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "INACTIVE";
export type AssetStatus = "AVAILABLE" | "ASSIGNED" | "UNDER_REPAIR" | "RETIRED";
export type AssetCondition = "GOOD" | "DAMAGED" | "NEEDS_REPAIR";
export type AssetEventType =
  | "PURCHASED"
  | "ASSIGNED"
  | "RETURNED"
  | "REPAIR_STARTED"
  | "REPAIR_COMPLETED"
  | "RETIRED";

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  employeeId: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserRef {
  id: string;
  name: string;
}

export interface Asset {
  id: string;
  organizationId: string;
  assetTag: string;
  name: string;
  category: string;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  status: AssetStatus;
  purchaseDate: string | null;
  purchasePrice: string | null;
  currentAssigneeId: string | null;
  currentAssignee?: UserRef | null;
  expectedReturnDate: string | null;
  location: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetEvent {
  id: string;
  organizationId: string;
  assetId: string;
  asset?: { id: string; assetTag: string; name: string };
  eventType: AssetEventType;
  fromUser?: UserRef | null;
  toUser?: UserRef | null;
  performedBy?: UserRef | null;
  eventDate: string;
  expectedReturnDate: string | null;
  condition: AssetCondition | null;
  notes: string | null;
  createdAt: string;
}

export interface Employee extends User {
  _count?: { assignedAssets: number };
  assignedAssets?: Pick<
    Asset,
    "id" | "assetTag" | "name" | "category" | "status" | "expectedReturnDate"
  >[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface DashboardSummary {
  total: number;
  available: number;
  assigned: number;
  underRepair: number;
  retired: number;
}
