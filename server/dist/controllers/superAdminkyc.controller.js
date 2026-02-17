export class Superadminkyc {
    constructor(service) {
        this.service = service;
        this.hospitals = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 8;
                const search = req.query.search;
                const filterStr = req.query.filter;
                let filter = {};
                if (filterStr && filterStr !== 'all') {
                    filter = { reviewStatus: filterStr };
                }
                else {
                    filter = { reviewStatus: { $in: ['pending', 'revision', 'rejected'] } };
                }
                const result = await this.service.hospitals({ page, limit, search, filter });
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    total: result.total,
                    page,
                    limit,
                    totalPages: Math.ceil(result.total / limit)
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
        };
        this.hospitalStatus = async (req, res) => {
            try {
                const { id, status } = req.params;
                const { rejectionReason } = req.body;
                const result = await this.service.updateHospitalStatus(id, status, rejectionReason);
                return res.status(200).json({
                    success: true,
                    message: "Status updated successfully",
                    data: result
                });
            }
            catch (error) {
                return res.status(500).json({ success: false, message: error.message });
            }
        };
        this.reapply = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.service.updateHospitalStatusReapply(id);
                return res.status(200).json({
                    success: true,
                    message: "Status updated successfully",
                    data: result
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "An unexpected error occurred";
                return res.status(500).json({
                    success: false,
                    message: message
                });
            }
        };
    }
}
