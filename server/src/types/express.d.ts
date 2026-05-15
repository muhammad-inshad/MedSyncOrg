import { IAccessTokenPayload } from "../services/token/token.service.interface.js";
import { IPatient } from "../models/Patient.model.js";
import { IHospital } from "../models/hospital.model.js";
import { IDoctor } from "../models/doctor.model.js";

declare global {
    namespace Express {
        interface User extends IAccessTokenPayload, Partial<IPatient>, Partial<IHospital>, Partial<IDoctor> { }
        interface Request {
            user?: User;
        }
    }
}
