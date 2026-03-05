export interface IssueTypeModel {
  issueTypeId: number;
  issueType: string;

  active: boolean;
  deleted: boolean;

  createdUser: string;
  createdDate: string;   // ISO string
  modifiedUser: string;
  modifiedDate: string;  // ISO string
  deletedUser: string;
  deletedDate: string;   // ISO string

  mediaRules?: IssueMediaRuleModel[];
}

export interface IssueMediaRuleModel {
  issueMediaRuleId: number;

  issueMediaFormatId: number;
  issueMediaFormat: string;

  min: number;
  max: number;
  maxSizeMB: number;

  createdUser: string;
  createdDate: string;   // ISO string
  active: boolean;
  modifiedUser: string;
  modifiedDate: string;  // ISO string

  mediaTypes?: IssueMediaRuleTypeModel[];
}

export interface IssueMediaRuleTypeModel {
  issueMediaRuleId: number;
  issueMediaRuleTypeId: number;

  issueMediaTypeId: number;
  issueMediaType: string;

  isMandatory: boolean;

  createdUser: string;
  createdDate: string;   // ISO string
  active: boolean;
  modifiedUser: string;
  modifiedDate: string;  // ISO string
}