


export interface RoleModel {
  roleId: number;
  roleName: string;
  isMandatory: boolean;
  rolePurpose: string;

  applicationId: number;
  // platformId might be needed if it's part of the form/response
  platformId?: number;

  active: boolean;
  deleted: boolean;

  createdDate: string;
  createdUser: string;

  modifiedDate: string | null;
  modifiedUser: string;

  deletedUser: string;
  deletedDate: string | null;

  // For Edit Mode details (assuming structure based on requirement)
  rolePlanDetails?: RolePlanDetail[];
}

export interface RolePlanDetail {
  rolePlanLinkId: number;
  planId: number;
  planName: string;
  // actions linked to this plan for this role
  actions: RoleActionDetail[];
}

export interface RoleActionDetail {
  rolePlanActionLinkId?: number; // helper ID if needed
  actionLinkId: number;
  active: boolean;
}

// Payload Interfaces
export interface PlanActionLinkCreateDto {
  planId: number;
  actionLinkIds: number[];
}

export interface UpdateActionLinkContainerDto {
  rolePlanLinkId: number;
  updateActionLinks: UpdateActionLinkDto[];
}

export interface UpdateActionLinkDto {
  actionLinkId: number;
  active: boolean;
}
