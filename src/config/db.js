import mongoose from "mongoose";

export const connectToDb = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}`);
        if (conn) console.log(`Database is connected on: ${conn.connection.host}`)
    } catch (error) {
        console.log(`Database connection error: ${error}`)
    }
}