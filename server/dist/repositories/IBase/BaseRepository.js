export class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data, session) {
        const createdEntity = new this.model(data);
        return await createdEntity.save(session ? { session } : undefined);
    }
    async findById(id) {
        return await this.model.findById(id).exec();
    }
    async findAll() {
        return await this.model.find().exec();
    }
    async update(id, data) {
        const updateData = { ...data };
        delete updateData._id;
        delete updateData.id;
        const updated = await this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
        return updated;
    }
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id).exec();
        return !!result;
    }
    async countDocuments(filter = {}) {
        return await this.model.countDocuments(filter).exec();
    }
    async findByEmail(email) {
        return await this.model.findOne({ email }).exec();
    }
    async findByEmailWithPassword(email) {
        return await this.model.findOne({ email }).select('+password').exec();
    }
    async findByIdWithPassword(id) {
        return await this.model.findById(id).select('+password').exec();
    }
    async findWithPagination(options) {
        const { page, limit, search, searchFields, filter } = options;
        const skip = (page - 1) * limit;
        let query = filter ? { ...filter } : {};
        if (search && searchFields && searchFields.length > 0) {
            const searchRegex = new RegExp(search, 'i');
            const searchConditions = searchFields.map(field => ({ [field]: searchRegex }));
            query = {
                ...query,
                $or: searchConditions
            };
        }
        const [data, total] = await Promise.all([
            this.model.find(query).skip(skip).limit(limit).exec(),
            this.model.countDocuments(query).exec()
        ]);
        return { data, total, page, limit };
    }
    async findByFilter(filter) {
        return await this.model.find(filter).exec();
    }
    async findOne(filter) {
        return await this.model.findOne(filter).exec();
    }
}
