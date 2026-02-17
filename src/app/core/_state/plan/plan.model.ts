import { ProgramActionModel } from "../program-action/program-action.model";

export interface ProgramPlanDetail {
  programId: number;
  programName: string;
  actions: ProgramActionModel[];
}

export interface PlanModel {
  planId: number;
  planName: string;
  programPlanDetails?: ProgramPlanDetail[];

  active: boolean;
  deleted: boolean;

  createdUser: string;
  createdDate: string;
  modifiedUser: string;
  modifiedDate: string;

  deletedUser: string;
  deletedDate: string | null;
}