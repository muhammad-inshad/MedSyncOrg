export interface PaginationMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages?: number;
      currentPage?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
}