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

        // this means, i'm creating a object in local memory by mongoose like db's data(object)
        const newUser = new User({
            fullname,
            email,
            password: hashedPassword
        })

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();  // after this, newUser data is saved into db

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

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            res.status(400).json({ message: "Profile picture is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        )

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error from updateProfile controller:", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log('Error from checkAuth controller.', error.message);
        res.status(401).json({ message: "Unauthorized access" });
    }
}