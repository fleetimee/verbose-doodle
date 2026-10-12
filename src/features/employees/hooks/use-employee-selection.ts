import { useState } from "react";
import type {
  EmployeeSummary,
  EmployeeSupervisor,
} from "@/features/employees/types";

type ProfileSelection = {
  employee: EmployeeSummary;
  initialTab: "employment" | "reporting";
};
type SelectionState = {
  current: ProfileSelection | null;
  history: ProfileSelection[];
};

export function useEmployeeSelection() {
  const [state, setState] = useState<SelectionState>({
    current: null,
    history: [],
  });
  function select(employee: EmployeeSummary) {
    setState({ current: { employee, initialTab: "employment" }, history: [] });
  }
  function follow(supervisor: EmployeeSupervisor) {
    setState((previous) => {
      if (
        !previous.current ||
        previous.current.employee.nrp === supervisor.nrp
      ) {
        return previous;
      }
      return {
        current: {
          employee: {
            nrp: supervisor.nrp,
            name: supervisor.name,
            nip: supervisor.nip,
            position: supervisor.position,
            unitKerja: supervisor.unit,
            branch: null,
          },
          initialTab: "employment",
        },
        history: [
          ...previous.history,
          { ...previous.current, initialTab: "reporting" },
        ],
      };
    });
  }
  function back() {
    setState((previous) => {
      const current = previous.history.at(-1);
      return current
        ? { current, history: previous.history.slice(0, -1) }
        : previous;
    });
  }
  function clear() {
    setState({ current: null, history: [] });
  }
  return {
    employee: state.current?.employee,
    nrp: state.current?.employee.nrp ?? null,
    initialTab: state.current?.initialTab ?? "employment",
    hasPrevious: state.history.length > 0,
    select,
    follow,
    back,
    clear,
  };
}
