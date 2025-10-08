import express from 'express'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import { config } from 'dotenv';
import { connectToDb } from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'

config();

const app = express();
const port = process.env.PORT;
const databaseConnection = connectToDb();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.get('/', (req, res) => {
    res.send('Server is running properly!')
})

app.use('/api/auth', authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    databaseConnection;
})