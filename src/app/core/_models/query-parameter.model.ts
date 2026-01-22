export interface QueryParameterModel {
    SortBy?: string;
    SortOrder?: 'Asc' | 'Desc';
    SearchText?: string;
    SearchBy?: string;
    PageNumber?: number;
    Limit?: number;
}