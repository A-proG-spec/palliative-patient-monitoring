export const patientBasePath = (isAdmin: boolean): string =>
  isAdmin ? '/admin/patients' : '/patients';

export const patientPath = (isAdmin: boolean, patientId: string): string =>
  `${patientBasePath(isAdmin)}/${patientId}`;
