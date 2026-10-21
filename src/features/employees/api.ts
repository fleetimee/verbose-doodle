import type {
  EmployeeDetails,
  EmployeeFilters,
  EmployeePage,
  EmployeePresencePage,
  EmployeeQuery,
  EmployeeSalaryPage,
} from "@/features/employees/types";
import { apiGet } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export async function searchEmployees(
  query: EmployeeQuery,
  signal: AbortSignal
) {
  const params = new URLSearchParams({
    search: query.search,
    activeOnly: String(query.activeOnly),
    includeOutsourcing: String(query.includeOutsourcing),
    branchCode: query.branchCode,
    page: String(query.page),
    size: "50",
  });
  if (query.unitCode) {
    params.set("unitCode", query.unitCode);
  }
  const response = await apiGet<{ data: EmployeePage }>(
    `${API_ENDPOINTS.admin.employees.list}?${params}`,
    { signal, cache: "no-store" }
  );
  return response.data;
}

export async function fetchEmployeeFilters(
  branchCode: string,
  signal: AbortSignal
) {
  const response = await apiGet<{ data: EmployeeFilters }>(
    `${API_ENDPOINTS.admin.employees.list}/filters?${new URLSearchParams({ branchCode })}`,
    { signal, cache: "no-store" }
  );
  return response.data;
}

export async function fetchEmployee(nrp: number, signal: AbortSignal) {
  const response = await apiGet<{ data: { employee: EmployeeDetails } }>(
    API_ENDPOINTS.admin.employees.detail(nrp),
    { signal, cache: "no-store" }
  );
  return response.data.employee;
}

export async function fetchEmployeePresence(
  nrp: number,
  year: string,
  month: string,
  recordedOnly: boolean,
  page: number,
  signal: AbortSignal
) {
  const params = new URLSearchParams({
    page: String(page),
    recordedOnly: String(recordedOnly),
  });
  if (year !== "all") {
    params.set("year", year);
    if (month !== "all") {
      params.set("month", month);
    }
  }
  const response = await apiGet<{ data: EmployeePresencePage }>(
    `${API_ENDPOINTS.admin.employees.detail(nrp)}/presence?${params}`,
    { signal, cache: "no-store" }
  );
  return response.data;
}

export async function fetchEmployeeSalary(
  nrp: number,
  month: string,
  page: number,
  signal: AbortSignal
) {
  const params = new URLSearchParams({ page: String(page) });
  if (month) {
    params.set("tanggal", `${month}-01`);
  }
  const response = await apiGet<{ data: EmployeeSalaryPage }>(
    `${API_ENDPOINTS.admin.employees.detail(nrp)}/salary?${params}`,
    { signal, cache: "no-store" }
  );
  return response.data;
}
