export interface ProgramActionModel {
  actionId: number;
  actionName: string;
  active: boolean;
  deleted: boolean;

  createdDate: string;      // ISO date string from API (e.g. "2026-01-16T16:31:17.069")
  createdUser: string;

  modifiedDate: string;     // ISO date string
  modifiedUser: string;

  deletedUser: string;      // can be empty/space
  deletedDate: string | null;
}