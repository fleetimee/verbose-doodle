export interface EmployeeSummary {
  branch: string | null;
  name: string | null;
  nip: string | null;
  nrp: number;
  position: string | null;
  unitKerja: string | null;
}

export interface EmployeeSupervisor {
  name: string | null;
  nip: string | null;
  nrp: number;
  position: string | null;
  soid: number;
  unit: string | null;
}

export interface EmployeeDetails extends EmployeeSummary {
  active: boolean | null;
  address: string | null;
  age: number | null;
  birthDate: string | null;
  birthPlace: string | null;
  birthYear: number | null;
  certifications: EmployeeCertification[];
  city: string | null;
  district: string | null;
  domicileAddress: string | null;
  education: EmployeeEducation[];
  email: string | null;
  employmentCategory: string | null;
  employmentStartDate: string | null;
  fatherName: string | null;
  kelurahan: string | null;
  motherName: string | null;
  officeCity: string | null;
  phone: string | null;
  postalCode: string | null;
  province: string | null;
  secondaryPhone: string | null;
  supervisors: EmployeeSupervisor[];
  tenure: { years: number; months: number; asOfDate: string } | null;
  training: EmployeeTraining[];
  unitCode: string | null;
  unitKerja: string | null;
  village: string | null;
  workHistory: EmployeeWorkHistory[];
}

export interface EmployeePage {
  employees: EmployeeSummary[];
  hasMore: boolean;
  page: number;
  size: number;
  total: number;
}

export interface EmployeeFilterOption {
  code: string;
  name: string;
}

export interface EmployeeFilters {
  branches: EmployeeFilterOption[];
  units: EmployeeFilterOption[];
}

export interface EmployeeQuery {
  activeOnly: boolean;
  branchCode: string;
  includeOutsourcing: boolean;
  page: number;
  search: string;
  unitCode: string;
}

export interface EmployeeEducation {
  endYear: string | null;
  faculty: string | null;
  graduationStatus: string | null;
  institution: string | null;
  level: string | null;
  major: string | null;
  sequence: number;
  startYear: string | null;
}

export interface EmployeeWorkHistory {
  branch: string | null;
  decisionDate: string | null;
  decisionNumber: string | null;
  effectiveDate: string | null;
  employmentCategory: string | null;
  position: string | null;
  sequence: number;
  unit: string | null;
}

export interface EmployeeCertification {
  endDate: string | null;
  expiryDate: string | null;
  issuedDate: string | null;
  name: string | null;
  provider: string | null;
  sequence: number;
  source: "CERTIFICATION" | "TRAINING";
  startDate: string | null;
}

export interface EmployeeTraining {
  certificationRelated: boolean | null;
  endDate: string | null;
  expiryDate: string | null;
  issuedDate: string | null;
  name: string | null;
  provider: string | null;
  sequence: number;
  startDate: string | null;
}

export interface EmployeePresence {
  checkIn: string | null;
  checkOut: string | null;
  date: string;
  recordedOffice: string | null;
  shift: string | null;
  statusCode: string | null;
}

export interface EmployeePresencePage {
  hasMore: boolean;
  page: number;
  records: EmployeePresence[];
  years: number[];
}
