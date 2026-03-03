


export interface RoleModel {
  roleId: number;
  roleName: string;
  isMandatory: boolean;
  rolePurpose: string;

  applicationId: number;
  platformId: number;
  platform: string;
  active: boolean;
  deleted: boolean;

  createdDate: string;
  createdUser: string;

  modifiedDate: string | null;
  modifiedUser: string;

  deletedUser: string;
  deletedDate: string | null;

  // New structure
  planRoleActionLink?: PlanRoleActionLink[];
}

export interface PlanRoleActionLink {
  planRoleLinkId: number;
  planId: number;
  planActionLink: PlanActionLink[];
  active?: boolean;
}

export interface PlanActionLink {
  actionLinkId: number;
  actionName: string;
  active: boolean;
  createdUser?: string;
  createdDate?: string;
  modifiedUser?: string;
  modifiedDate?: string;
  // any other fields from API if needed
}

// Payload Interfaces
export interface createPlanActionLink {
  planId: number;
  actionLinkIds: number[];
}

export interface updatePlanActionLinks {
  rolePlanLinkId: number;
  active?: boolean;
  updateActionLinks: UpdateActionLinkDto[];
}

export interface UpdateActionLinkDto {
  actionLinkId: number;
  active: boolean;
}
