/**
 * Business Activity Model matching the C# backend structure
 */
export interface BusinessActivityModel {
  Id: number;
  Name: string;
  Active: boolean;
  Delete: boolean;
  CreatedUser: string;
  CreatedDate: string;              // ISO date string from DateTime
  ModifiedUser: string;
  ModifiedDate: string | null;      // ISO date string or null
  DeletedUser: string;
  DeletedDate: string | null;       // ISO date string or null
}