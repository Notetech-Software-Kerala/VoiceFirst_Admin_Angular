export interface MenuModel {
    webMenuId: number;
    parentId: number;
    menuId: number;
    menuName: string;
    icon: string;
    route: string;
    sortOrder: number;
    active: boolean;
    deleted: boolean;
    createdDate: string;
    createdUser: string;
    modifiedDate: string | null;
    modifiedUser: string;
    deletedUser: string;
    deletedDate: string | null;
}

export interface MasterMenu {
    menuId: number;
    menuName: string;
    icon: string;
    route: string;
    plateFormId: number;
    active: boolean;
    deleted: boolean;
    createdUser: string | null;
    createdDate: string;
    modifiedUser: string | null;
    modifiedDate: string | null;
    deletedUser: string | null;
    deletedDate: string | null;
}