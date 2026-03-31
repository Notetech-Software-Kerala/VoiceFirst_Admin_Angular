
export interface CustomFieldModel {
  customFieldId: number;
  fieldName: string;
  fieldKey: string;
  fieldDataTypes?: CustomFieldDataTypeModel[];
  deleted: boolean;
  active: boolean;

  createdUser: string;
  createdDate: string;

  modifiedUser: string;
  modifiedDate: string;

  deletedUser: string;
  deletedDate: string | null;
}
export interface CustomFieldDataTypeModel {
  customFieldLinkId: number;
  fieldDataTypeId: number;
  customFieldId: number;
  fieldDataType: string;
  valueDataType: string;
  validations?: CustomFieldValidation[];
  options?: CustomFieldOption[];
  active: boolean;

  createdDate: string;
  createdUser: string;
  modifiedDate: string | null;
  modifiedUser: string;
}

export interface CustomFieldValidation {
  customFieldValidationId: number;
  ruleId?: number;
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