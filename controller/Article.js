import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fetch from 'node-fetch';
import Article from '../models/ArticleModel.js';
import User from '../models/UserModel.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

// 1️⃣ Create and Save Generated Article (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const user = req.user; // ✅ from JWT middleware

    if (!content) return res.status(400).json({ message: 'content is required' });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Generate a title and summary for this article text:
                  "${content}"
                  Format response exactly like this:
                  Title: <title>
                  Summary: <summary>`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    if (!response.ok)
      return res.status(500).json({ message: data?.error?.message || 'Failed to generate content' });

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const titleMatch = text.match(/Title:\s*(.*)/i);
    const summaryMatch = text.match(/Summary:\s*([\s\S]*)/i);

    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available';

    // ✅ Save article to database
    const newArticle = new Article({
      title,
      content,
      summary,
      user: user._id
    });
    await newArticle.save();

    res.json({ title, summary });
    } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2️⃣ Get Article by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('user', 'name email');
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3️⃣ Get All Articles of Logged-in User (Protected)
router.get('/user/me', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const articles = await Article.find({ user: user._id }).sort({ createdAt: -1 });
    console.log('Fetched articles for user:', user._id, articles.length);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching user articles:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
