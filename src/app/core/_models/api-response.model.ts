/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    error: string | null;
    data: T;
}

/**
 * Paginated Data Response
 */
export interface PaginatedData<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
