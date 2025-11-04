import dotenv from 'dotenv';
import mongoose, { connect } from 'mongoose';
dotenv.config();
const MONGODB_URL = process.env.MONGODB_URL ;

export default async function connectDB() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(MONGODB_URL);

        mongoose.connection.on('connected', () => {
            console.log(`MongoDB connected to ${mongoose.connection.name}`);
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

        return mongoose.connection;
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
    }
}


connectDB();