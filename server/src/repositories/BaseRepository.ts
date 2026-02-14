import { Model, Document } from "mongoose";
import { IBaseRepository } from "../interfaces/IBaseRepository.ts";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    constructor(private readonly model: Model<T>) { }

    async create(data: Partial<T>): Promise<T> {
        const newDoc = new this.model(data);
        return await newDoc.save();
    }

    async findAll(): Promise<T[]> {
        return await this.model.find();
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    async findOne(filter: object): Promise<T | null> {
        return await this.model.findOne(filter);
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }

    async findByEmail(email: string): Promise<T | null> {
        return await this.model.findOne({ email } as any);
    }

    async findByEmailWithPassword(email: string): Promise<T | null> {
        return await this.model.findOne({ email } as any).select("+password");
    }

    async updatePassword(email: string, password: string): Promise<T | null> {
        return await this.model.findOneAndUpdate({ email } as any, { password } as any, { new: true });
    }

    async findWithPagination(options: {
        page: number;
        limit: number;
        filter?: object;
        search?: string;
        searchFields?: string[];
    }): Promise<{ data: T[]; total: number; totalPages: number }> {
        const { page, limit, filter = {}, search, searchFields = [] } = options;
        const skip = (page - 1) * limit;
        console.log(page)
        const queryFilter: any = { ...filter };
        if (search && searchFields.length > 0) {
            const trimmedSearch = search.trim();
            const regexCondition = { $regex: trimmedSearch, $options: "i" };
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmedSearch);
            queryFilter.$or = searchFields.map(field => {
                if (field === '_id') {
                    return isObjectId ? { _id: trimmedSearch } : null;
                }
                return { [field]: regexCondition };
            }).filter(Boolean);
        }
        const [data, total] = await Promise.all([
            this.model.find(queryFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.model.countDocuments(queryFilter).exec()
        ]);

        return {
            data,
            total,
            totalPages: Math.ceil(total / limit)
        };
    }
}
