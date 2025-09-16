import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsers = async (req, res) => {
    try {
        const myId = req.user._id;
        const otherUsers = await User.find({ _id: { $ne: myId } }).select("-password");

        res.status(200).json(otherUsers);
    } catch (error) {
        console.log("Error of getUsers controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: receiverId },
                { senderId: receiverId, receiverId: myId }
            ]
        })

        res.send(200).json(messages);
    } catch (error) {
        console.log("Error of getMessages controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}