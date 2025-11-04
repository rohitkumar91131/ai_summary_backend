import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Articles from './controller/Article.js'; 
dotenv.config();

import './config/db.js';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/article', Articles);

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
