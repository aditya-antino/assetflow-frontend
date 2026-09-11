import { api } from "./api";
import { ApiResponse, Employee } from "../types";

export async function listEmployees(search?: string) {
  const res = await api.get<ApiResponse<Employee[]>>("/employees", { params: { search } });
  return res.data.data;
}

export async function getEmployee(id: string) {
  const res = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
  return res.data.data;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  employeeId: string;
  department?: string;
  role: "ADMIN" | "EMPLOYEE";
}

export async function createEmployee(input: CreateEmployeeInput) {
  const res = await api.post<ApiResponse<Employee & { temporaryPassword?: string }>>(
    "/employees",
    input
  );
  return res.data.data;
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  department?: string;
  role?: "ADMIN" | "EMPLOYEE";
  status?: "ACTIVE" | "INACTIVE";
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const res = await api.patch<ApiResponse<Employee>>(`/employees/${id}`, input);
  return res.data.data;
}
