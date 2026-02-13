import { ProgramActionModel } from "../program-action/program-action.model";

export interface ProgramModel {
  programId: number;
  programName: string;
  label: string;
  route: string;

  platformId: number;
  platformName: string;

  companyId: number;
  companyName: string;

  active: boolean;
  deleted: boolean;

  createdUser: string;
  createdDate: string;
  modifiedUser: string;
  modifiedDate: string;

  deletedUser: string;
  deletedDate: string | null;

  action: ProgramActionModel[];
}

export interface ProgramLookupModel {
  programId: number;
  programName: string;
  action: {
    actionLinkId: number;
    actionName: string;
  }[];
}