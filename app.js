import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ArticleRoutes from './controller/Article.js'; 
import UserRoutes from './controller/User.js';  
import cookieParser from "cookie-parser";
dotenv.config();

import './config/db.js';
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials : true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/article', ArticleRoutes);
app.use('/auth', UserRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Hello from AI Text Summariser backend' });
});

app.get('/health', (req, res) => {
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
