import { IAccessTokenPayload } from "../services/token/token.service.interface.ts";
import { IPatient } from "../models/Patient.model.ts";
import { IHospital } from "../models/hospital.model.ts";
import { IDoctor } from "../models/doctor.model.ts";

declare global {
    namespace Express {
        interface User extends IAccessTokenPayload, Partial<IPatient>, Partial<IHospital>, Partial<IDoctor> { }
        interface Request {
            user?: User;
        }
    }
}
