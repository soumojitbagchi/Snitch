import jwt from 'jsonwebtoken'
import userData from '../model/user.model.js';
import { config } from '../config/config.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized",
        });
    }
    try {
        const decoded = jwt.verify(token, config.JWT_KEY);
        const legitUser = await userData.findById(decoded.id);
        if (legitUser.role ==='buyer') {
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
            });
        }
        req.user = legitUser;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized",
        });
    }
}
