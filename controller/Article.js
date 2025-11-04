import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    console.log('Received content:', content);
    if (!content) return res.status(400).json({ message: 'content is required' });

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
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
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data });


    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const titleMatch = text.match(/Title:\s*(.*)/i);
    const summaryMatch = text.match(/Summary:\s*([\s\S]*)/i);
    console.log('Generated Text:', text); 

    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available';

    res.json({ title, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
