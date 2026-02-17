import jwt from "jsonwebtoken";
import { StatusCode } from "../constants/statusCodes.ts";
import { MESSAGES } from "../constants/messages.ts";
export const protect = (req, res, next) => {
    try {
        // Check for token in cookies or Authorization header
        let token = req.cookies.accessToken;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7); // Remove "Bearer " prefix
            }
        }
        if (!token) {
            res.status(StatusCode.UNAUTHORIZED).json({
                success: false,
                message: MESSAGES.AUTH.UNAUTHORIZED,
            });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(StatusCode.UNAUTHORIZED).json({
            success: false,
            message: MESSAGES.AUTH.SESSION_EXPIRED,
        });
    }
};
