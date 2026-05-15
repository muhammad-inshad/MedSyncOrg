import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
export class SuperAdminKycController {
    constructor(service) {
        this.service = service;
        this.hospitals = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 8;
                const search = req.query.search;
                const filterStr = req.query.filter;
                let filter = {};
                if (filterStr && filterStr !== "all") {
                    filter = { reviewStatus: filterStr };
                }
                else {
                    filter = { reviewStatus: { $in: ["pending", "revision", "rejected"] } };
                }
                const result = await this.service.hospitals({ page, limit, search, filter });
                ApiResponse.success(res, "Hospitals fetched successfully", result.data, HttpStatusCode.OK, {
                    page,
                    limit,
                    totalItems: result.total,
                    totalPages: Math.ceil(result.total / limit)
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
