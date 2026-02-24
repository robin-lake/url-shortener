import express from 'express';
import cors from 'cors';
import { shortenUrl, getOriginalUrl } from './urlService';

const app = express();

app.use(express.json());
// CORS in Lambda is handled by API Gateway (corsPreflight). The cors package
// calls res.on() which fails on Lambda's response proxy, so only use it locally.
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
}

app.get('/', (req, res) => {
   res.status(200).json({message: "this is the api for url shortner. make a request to /shorten"})
})

app.post('/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'A valid url is required' });
    return;
  }

  const shortCode = shortenUrl(url);
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  res.json({ shortUrl: `${baseUrl}/${shortCode}` });
});

app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = getOriginalUrl(shortCode);

  if (!originalUrl) {
    res.status(404).json({ error: 'Short URL not found' });
    return;
  }

  res.redirect(originalUrl);
});

export default app;
