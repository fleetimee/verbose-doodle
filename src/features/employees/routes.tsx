import { lazy } from "react";
import { Route } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";

const EmployeeDirectoryPage = lazy(() =>
  import("@/pages/dashboard/employee-directory").then(
    ({ EmployeeDirectoryPage }) => ({
      default: EmployeeDirectoryPage,
    })
  )
);

export const employeeRoutes = (
  <Route
    element={
      <ProtectedRoute requiredRole="ADMIN">
        <EmployeeDirectoryPage />
      </ProtectedRoute>
    }
    path="employees"
  />
);
