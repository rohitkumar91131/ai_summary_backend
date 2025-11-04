import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: String,
  content: { type: String, required: true },
  summary: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Article = mongoose.model('Article', articleSchema);
export default Article;
