
export interface CustomFieldModel {
  customFieldId: number;
  fieldName: string;
  fieldKey: string;
  fieldDataType: string;
  deleted: boolean;
  validations?: CustomFieldValidation[];
  options?: CustomFieldOption[];
  active: boolean;

  createdUser: string;
  createdDate: string;

  modifiedUser: string;
  modifiedDate: string;

  deletedUser: string;
  deletedDate: string | null;
}

export interface CustomFieldValidation {
  customFieldValidationId: number;
  ruleName: string;
  ruleValue: string;
  message: string;
  active: boolean;

  createdUser: string;
  createdDate: string;

  modifiedUser: string;
  modifiedDate: string;
}

export interface CustomFieldOption {
  customFieldOptionsId: number;
  label: string;
  value: string;
  active: boolean;
  createdUser: string;
  createdDate: string;

  modifiedUser: string;
  modifiedDate: string;

}