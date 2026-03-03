export interface EmployeeModel {
    employeeId: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    mobileNo: string;
    birthYear: string;
    dialCodeId: number;
    dialCode: string;
    active: boolean;
    deleted: boolean;

    createdUser: string;
    createdDate: string;

    modifiedUser?: string;
    modifiedDate?: string;

    deletedUser?: string;
    deletedDate?: string;

    employeeRoles?: any[];
}
