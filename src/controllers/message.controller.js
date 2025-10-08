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

// export const getUsers = async (req, res) => {
//     try {
//         const myId = req.user._id;

//         // Step 1: Aggregate unique user IDs that I've chatted with
//         const userIds = await Message.aggregate([
//             {
//                 $match: {
//                     $or: [{ senderId: myId }, { receiverId: myId }],
//                 },
//             },
//             {
//                 $project: {
//                     otherUser: {
//                         $cond: [
//                             { $eq: ["$senderId", myId] },
//                             "$receiverId",
//                             "$senderId",
//                         ],
//                     },
//                 },
//             },
//             {
//                 $group: { _id: "$otherUser" },
//             },
//         ]);

//         // Step 2: Extract the IDs into an array
//         const ids = userIds.map((u) => u._id);

//         // Step 3: Fetch those users’ info (excluding password)
//         const users = await User.find({ _id: { $in: ids } }).select("-password");

//         res.status(200).json(users);
//     } catch (error) {
//         console.log("Error of getUsers controller:", error.message);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

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

        // todo: real time implementation: socket.io

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error of sendMessages controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}