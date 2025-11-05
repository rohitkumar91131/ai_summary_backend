import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import Article from '../models/ArticleModel.js';
import User from '../models/UserModel.js';

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'content is required' });

    let userId = null;
    const token = req.cookies?.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.id) {
          const user = await User.findById(decoded.id).select('_id');
          if (user) userId = user._id;
        }
      } catch (err) {
        console.warn('Invalid or expired token, continuing anonymously');
      }
    }

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

    const newArticle = new Article({
      title,
      content,
      summary,
      user: userId || null
    });

    await newArticle.save();

    res.json({ title, summary });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

router.get('/user/me', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const articles = await Article.find({ user: user._id }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error('Error fetching user articles:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
