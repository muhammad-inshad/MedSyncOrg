import { Schema, model } from "mongoose";
export var SalaryRequestStatus;
(function (SalaryRequestStatus) {
    SalaryRequestStatus["PENDING"] = "PENDING";
    SalaryRequestStatus["APPROVED"] = "APPROVED";
    SalaryRequestStatus["REJECTED"] = "REJECTED";
})(SalaryRequestStatus || (SalaryRequestStatus = {}));
const salaryRequestSchema = new Schema({
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
    },
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    currentAmount: {
        type: Number,
        required: true,
    },
    requestedAmount: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    rejectionReason: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(SalaryRequestStatus),
        default: SalaryRequestStatus.PENDING,
    },
    approvedAmount: {
        type: Number,
    },
    approvalNote: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
export const SalaryRequestModel = model("SalaryRequest", salaryRequestSchema);
