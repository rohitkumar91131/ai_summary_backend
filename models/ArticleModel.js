import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'anonymous'
    },
    summary: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Article = mongoose.model('Article', articleSchema);

export default Article;