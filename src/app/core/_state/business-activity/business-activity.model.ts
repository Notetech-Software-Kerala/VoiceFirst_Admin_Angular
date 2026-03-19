
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

  activityCustomFields?: BusinessActivityCustomField[];
}

export interface BusinessActivityCustomField {
  activityCustomFieldLinkId: number;
  activityId: number;
  customFieldId: number;
  fieldDataType: string;
  fieldName: string;
  active: boolean;
  createdDate: string;
  createdUser: string;
  modifiedDate: string | null;
  modifiedUser: string | null;
}