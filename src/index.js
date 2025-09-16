import express from 'express'
import authRoutes from './routes/auth.route.js'
import dotenv from 'dotenv';
import { connectToDb } from './config/db.js';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT;
const databaseConnection = connectToDb();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Server is running properly!')
})

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    databaseConnection;
})