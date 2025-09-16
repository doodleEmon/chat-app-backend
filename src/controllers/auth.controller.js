import { generateToken } from "../lib/jwt.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export const signUp = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname) {
            res.status(400).json({ message: "Fullname is required." })
        }

        if (!email) {
            res.status(400).json({ message: "Email is required." })
        }

        if (!password) {
            res.status(400).json({ message: "Password is required." })
        }

        if (password.length < 8) {
            res.status(400).json({ message: "Password must not be less than 8 character." })
        }

        const user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: "Email already exist." })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword
        })

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        }

    } catch (error) {
        console.log('Error to signup controller:', error.message);
        res.status(500).json({ message: "Internal server error." });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            res.status(400).json({ message: "Email is required!" });
        }

        if (!password) {
            res.status(400).json({ message: "Password is required!" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({ message: "Invalid email! Please try with valid one." })
        }

        const isPasswordExist = await bcrypt.compare(password, user.password);

        if (!isPasswordExist) {
            res.status(400).json({ message: "Invalid password! Please enter valid password." })
        }

        generateToken(user._id, res);
        await res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.log('Error in login controller:', error.message);
        res.status(500).json({ message: "Internal server error!" })
    }

}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully!" })
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}