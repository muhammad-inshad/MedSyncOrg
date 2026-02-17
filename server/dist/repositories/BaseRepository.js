export class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        const newDoc = new this.model(data);
        return await newDoc.save();
    }
    async findAll() {
        return await this.model.find();
    }
    async findById(id) {
        return await this.model.findById(id);
    }
    async findOne(filter) {
        return await this.model.findOne(filter);
    }
    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }
    async findByEmail(email) {
        return await this.model.findOne({ email });
    }
    async findByEmailWithPassword(email) {
        return await this.model.findOne({ email }).select("+password");
    }
    async updatePassword(email, password) {
        return await this.model.findOneAndUpdate({ email }, { password }, { new: true });
    }
    async findWithPagination(options) {
        const { page, limit, filter = {}, search, searchFields = [] } = options;
        const skip = (page - 1) * limit;
        console.log(page);
        const queryFilter = { ...filter };
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
