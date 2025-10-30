import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsers = async (req, res) => {
    try {
        const myId = req.user._id;

        // Step 1: Aggregate unique user IDs with their latest message timestamp
        const userIds = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: myId }, { receiverId: myId }],
                },
            },
            {
                $project: {
                    otherUser: {
                        $cond: [
                            { $eq: ["$senderId", myId] },
                            "$receiverId",
                            "$senderId",
                        ],
                    },
                    createdAt: 1, // Include timestamp
                },
            },
            {
                $sort: { createdAt: -1 }, // Sort by timestamp descending
            },
            {
                $group: {
                    _id: "$otherUser",
                    latestMessageTime: { $first: "$createdAt" }, // Get the latest message time
                },
            },
            {
                $sort: { latestMessageTime: -1 }, // Sort users by latest message
            },
        ]);

        // Step 2: Extract the IDs into an array (preserving order)
        const ids = userIds.map((u) => u._id);

        // Step 3: Fetch those users' info (excluding password)
        const users = await User.find({ _id: { $in: ids } }).select("-password");

        // Step 4: Sort users array to match the order from aggregation
        const sortedUsers = ids.map(id =>
            users.find(user => user._id.toString() === id.toString())
        ).filter(Boolean); // Remove any null values

        res.status(200).json(sortedUsers);
    } catch (error) {
        console.log("Error of getUsers controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

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

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error of getMessages controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendMessages = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const myId = req.user._id;
        const { text, image } = req.body;

        // if image provided, then have to upload into cloudinary and take a image url
        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId: myId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save();


        // REAL-TIME SOCKET.IO IMPLEMENTATION
        // ============================================Start

        // Step 1: Get the receiver's socket ID from the Map
        const receiverSocketId = getReceiverSocketId(receiverId);

        // Step 2: Get the sender's socket ID from the Map
        const senderSocketId = getReceiverSocketId(myId);

        // Step 3: If receiver is online, emit the message to them
        if (receiverSocketId) {
            // Send new message to receiver
            io.to(receiverSocketId).emit("newMessage", newMessage);

            // Tell receiver to move sender to top of their user list
            io.to(receiverSocketId).emit("moveUserToTop", myId.toString());

            console.log(`Message sent to user ${receiverId} via socket ${receiverSocketId}`);
        } else {
            console.log(`User ${receiverId} is offline - message saved but not sent via socket`);
        }

        // Step 4: Update sender's user list (move receiver to top)
        if (senderSocketId) {
            // Tell sender to move receiver to top of their user list
            io.to(senderSocketId).emit("moveUserToTop", receiverId.toString());
            console.log(`Moved user ${receiverId} to top for sender ${myId}`);
        }

        // ============================================End

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error of sendMessages controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}