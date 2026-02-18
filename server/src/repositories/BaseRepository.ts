import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../interfaces/IBaseRepository.ts';

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    constructor(private readonly model: Model<T>) { }

    async create(data: Partial<T>): Promise<T> {
        const createdEntity = new this.model(data);
        return await createdEntity.save();
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id).exec();
    }

    async findAll(): Promise<T[]> {
        return await this.model.find().exec();
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data as UpdateQuery<T>, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id).exec();
        return !!result;
    }

    async findByEmail(email: string): Promise<T | null> {
        return await this.model.findOne({ email } as FilterQuery<T>).exec();
    }

    async findByEmailWithPassword(email: string): Promise<T | null> {
        return await this.model.findOne({ email } as FilterQuery<T>).select('+password').exec();
    }

    async findWithPagination(options: { page: number; limit: number; search?: string; searchFields?: string[]; filter?: object }): Promise<{ data: T[]; total: number; page: number; limit: number }> {
        const { page, limit, search, searchFields, filter } = options;
        const skip = (page - 1) * limit;

        let query: FilterQuery<T> = filter ? { ...filter } : {};

        if (search && searchFields && searchFields.length > 0) {
            const searchRegex = new RegExp(search, 'i');
            const searchConditions = searchFields.map(field => ({ [field]: searchRegex }));
            query = {
                ...query,
                $or: searchConditions
            } as FilterQuery<T>;
        }

        const [data, total] = await Promise.all([
            this.model.find(query).skip(skip).limit(limit).exec(),
            this.model.countDocuments(query).exec()
        ]);

        return { data, total, page, limit };
    }
}
