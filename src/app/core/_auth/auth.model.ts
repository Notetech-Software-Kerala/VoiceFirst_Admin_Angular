export interface LoginRequest {
    email: string;
    password: string;
    clientType: number;
    device: {
        deviceID: string;
        version: string;
        deviceName: string;
        deviceType: string;
        os: string;
        osVersion: string;
        manufacturer: string;
        model: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    appCode: string;
    data: T;
}

export interface LoginData {
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