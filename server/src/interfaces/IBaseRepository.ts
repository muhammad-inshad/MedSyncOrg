
export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(filter: object): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findByEmail(email: string): Promise<T | null>;
  findByEmailWithPassword(email: string): Promise<T | null>;
  findWithPagination(options: {
    page: number;
    limit: number;
    filter?: object;
    search?: string;
    searchFields?: string[];
  }): Promise<{ data: T[]; total: number; totalPages: number }>;
}