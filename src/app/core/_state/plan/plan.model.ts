

export interface PlanModel {
  planId: number,
  planName: string,

  active: boolean;
  deleted: boolean;

  createdUser: string;
  createdDate: string;
  modifiedUser: string;
  modifiedDate: string;

  deletedUser: string;
  deletedDate: string | null;

}