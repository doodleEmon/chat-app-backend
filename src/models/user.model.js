import mongoose from "mongoose";

// create schema
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    profilePic: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// create model
const User = mongoose.model('User', userSchema);
export default User;