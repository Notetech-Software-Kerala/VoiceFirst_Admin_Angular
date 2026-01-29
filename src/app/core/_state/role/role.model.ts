

export interface RoleModel {
  roleId: number;
  roleName: string;
  isMandatory: boolean;
  rolePurpose: string;

  applicationId: number;

  active: boolean;
  deleted: boolean;

  createdDate: string;          // ISO string (or Date if you convert)
  createdUser: string;

  modifiedDate: string | null;  // can be null
  modifiedUser: string;

  deletedUser: string;
  deletedDate: string | null;
}