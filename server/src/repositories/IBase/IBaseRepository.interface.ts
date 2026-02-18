export interface IBaseRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    findByEmail(email: string): Promise<T | null>;
    findWithPagination(options: { page: number; limit: number; search?: string; searchFields?: string[]; filter?: object }): Promise<{ data: T[]; total: number; page: number; limit: number }>;
    findByEmailWithPassword(email: string): Promise<T | null>;
}
