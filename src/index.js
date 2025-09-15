import express from 'express'
import authRoutes from './routes/auth.route.js'
import dotenv from 'dotenv';
import { connectToDb } from './config/db.js';

dotenv.config();
const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Server is running properly!')
})

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectToDb();
})