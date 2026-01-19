export interface LoginRequest {
    emailOrMobile: string;
    password: string;
    uniqueDeviceId: string; // GUID string
}

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    appCode: string;
    data: T;
}

export interface LoginData {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;
    accessToken: string;
    accessTokenExpiresAtUtc: string; // ISO string
}

export interface RefreshData {
    accessToken: string;
    accessTokenExpiresAtUtc: string; // ISO string
}

export interface UserInfo {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;
}