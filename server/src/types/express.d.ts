import { IAccessTokenPayload } from "../services/token/token.service.interface.ts";

declare global {
    namespace Express {
        interface User extends IAccessTokenPayload { }
        interface Request {
            user?: User;
        }
    }
}
