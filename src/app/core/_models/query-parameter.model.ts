export interface QueryParameterModel {
    SortBy?: string;
    SortOrder?: 'Asc' | 'Desc';
    SearchText?: string;
    PageNumber?: number;
    Limit?: number;
}