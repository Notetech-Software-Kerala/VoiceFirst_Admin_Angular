export interface PostOfficeModel {
  postOfficeId: number;
  postOfficeName: string;

  countryName: string;
  countryId: number;

  active: boolean;
  deleted: boolean;

  createdDate: string;
  createdUser: string;

  modifiedDate: string | null;
  modifiedUser: string;

  deletedUser: string | null;
  deletedDate: string | null;

  zipCodes: ZipCode[];
}

export interface ZipCode {
  zipCodeId: number;
  zipCode: string;

  active: boolean;

  createdDate: string;   // ISO date-time string
  createdUser: string;

  modifiedDate: string | null;
  modifiedUser: string | null; // in sample it's " "
}