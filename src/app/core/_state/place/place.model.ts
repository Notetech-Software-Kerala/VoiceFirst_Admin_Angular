import { ProgramActionModel } from "../program-action/program-action.model";

export interface PlaceModel {
  postOffices?: PostOffice[];
  zipCodes?: any[]; // For edit mode patching
  placeId: number;
  placeName: string;
  active: boolean;
  deleted: boolean;
  createdUser: string;
  createdDate: string;      // ISO string
  modifiedUser: string;
  modifiedDate: string | null;
  deletedUser: string;
  deletedDate: string | null;
}

export interface PostOffice {
  postOfficeId: number;
  postOfficeName: string;
  countryName: string;

  divisionOneLabel: string;
  divisionTwoLabel: string;
  divisionThreeLabel: string;

  divisionOneName: string;
  divisionTwoName: string;
  divisionThreeName: string;

  zipCodes: ZipCodeLink[];
}

export interface ZipCodeLink {
  placeZipCodeLinkId: number;
  zipCodeLinkId: number;
  zipCode: string;

  active: boolean;

  createdUser: string;
  createdDate: string;      // ISO string

  modifiedUser: string;
  modifiedDate: string | null;
}