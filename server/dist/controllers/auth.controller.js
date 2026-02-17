class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.signup = async (req, res) => {
            try {
                const signupData = req.body;
                const user = await this.authService.signup(signupData);
                return res.status(201).json({
                    success: true,
                    message: "Account created successfully",
                    user,
                });
            }
            catch (error) {
                return res.status(error.status || 400).json({
                    success: false,
                    message: error.message || "Failed to create account",
                });
            }
        };
        this.login = async (req, res) => {
            try {
                const loginData = req.body;
                const result = await this.authService.login(loginData);
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.cookie("accessToken", result.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 15 * 60 * 1000,
                    path: "/",
                });
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    data: {
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                        user: { ...result.user, role: loginData.role }
                    }
                });
            }
            catch (error) {
                return res.status(error.status || 401).json({
                    success: false,
                    message: error.message || "Login failed",
                });
            }
        };
        this.refresh = async (req, res) => {
            try {
                // Get refresh token from cookies, body, or Authorization header
                let refreshToken = req.cookies?.refreshToken;
                if (!refreshToken) {
                    // Try to get from request body
                    refreshToken = req.body?.refreshToken;
                }
                if (!refreshToken) {
                    // Try to get from Authorization header with 'Refresh ' prefix
                    const authHeader = req.headers.authorization;
                    if (authHeader && authHeader.startsWith("Refresh ")) {
                        refreshToken = authHeader.substring(8); // Remove "Refresh " prefix
                    }
                }
                if (!refreshToken) {
                    return res.status(401).json({ success: false, message: "Session expired" });
                }
                const result = await this.authService.refreshAccessToken(refreshToken);
                res.cookie("accessToken", result.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 15 * 60 * 1000,
                    path: "/",
                });
                // Return both success status and the new access token in the response body
                return res.status(200).json({
                    success: true,
                    data: {
                        accessToken: result.accessToken
                    }
                });
            }
            catch (error) {
                return res.status(401).json({ success: false, message: "Invalid session" });
            }
        };
        this.resetPassword = async (req, res) => {
            try {
                const { email, password, role } = req.body;
                const result = await this.authService.resetPassword(email, password, role);
                return res.status(200).json({ success: true, message: result.message });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: error.message || "Internal Server Error",
                });
            }
        };
        this.logout = async (req, res) => {
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            };
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);
            return res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });
        };
    }
}
export default AuthController;
