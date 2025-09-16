import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        res.status(401).json({ message: "Unauthorized access!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
        res.status(401).json({ message: "Unauthorized access!" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
        res.status(401).json({ message: "Unauthorized access!" });
    }

    req.user = user;

    next();
}