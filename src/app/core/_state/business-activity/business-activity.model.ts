/**
 * Business Activity Model matching the C# backend structure
 */
export interface BusinessActivityModel {
  activityId: number;
  activityName: string;
  active: boolean;
  deleted: boolean;

  createdUser: string;
  createdDate: string;

  modifiedUser: string;
  modifiedDate: string;

  deletedUser: string;
  deletedDate: string | null;
}