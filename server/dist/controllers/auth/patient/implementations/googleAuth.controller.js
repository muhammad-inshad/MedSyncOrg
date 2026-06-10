import logger from '../../../../utils/logger.js';
export class GoogleAuthController {
    constructor(tokenService) {
        this.tokenService = tokenService;
    }
    async handleCallback(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
            }
            const userPayload = user.toObject ? user.toObject() : user;
            // Get role from state, default to 'patient'
            const role = req.query.state || 'patient';
            const cleanPayload = {
                userId: userPayload._id.toString(),
                email: userPayload.email,
                role: role
            };
            const accessToken = this.tokenService.generateAccessToken(cleanPayload);
            const refreshToken = this.tokenService.generateRefreshToken(cleanPayload);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1000,
            });
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1000,
                path: "/",
            });
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const userData = encodeURIComponent(JSON.stringify({
                _id: userPayload._id,
                email: userPayload.email,
                name: userPayload.name,
                role: role
            }));
            return res.redirect(`${frontendUrl}/google-success?user=${userData}&role=${role}`);
        }
        catch (error) {
            logger.error("Google Auth Controller Error:", error);
            next(error);
        }
    }
}
