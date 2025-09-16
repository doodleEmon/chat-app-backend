import mongoose from "mongoose";
import User from "./user.model";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    text: {
        type: String,
    },
    photo: {
        type: String
    }
}, {
    timestamps: true
})

const Message = mongoose.model("Message", messageSchema);
export default Message;