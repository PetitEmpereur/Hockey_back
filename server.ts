
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRouter from './app/api/routes_mail/emails';


dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' })); // autorise ton front
app.use(express.json());
app.use('/api/email', emailRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
