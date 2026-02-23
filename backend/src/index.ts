import express from 'express';
import cors from 'cors';
import { shortenUrl, getOriginalUrl } from './urlService';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
// app.use(cors({ origin: 'https://shortener.robinlake.ca' }));

app.post('/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'A valid url is required' });
    return;
  }

  const shortCode = shortenUrl(url);
  res.json({ shortUrl: `http://localhost:${PORT}/${shortCode}` });
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
