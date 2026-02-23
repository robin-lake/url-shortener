import { useState } from 'react';
import { useFetch } from '../api/api';

type ShortenResponse = { shortUrl: string };

export default function Shorten() {
  const [inputUrl, setInputUrl] = useState('');

  const { data, loading, error, execute } = useFetch<ShortenResponse, { url: string }>(
    'http://localhost:3000/shorten',
    { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl) execute({ url: inputUrl });
  };

  return (
    <div>
      <h2>Shorten New URL</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Enter URL"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>
      {error && <p>Error: {error}</p>}
      {data?.shortUrl && (
        <p>Short URL: <a href={data.shortUrl} target="_blank" rel="noreferrer">{data.shortUrl}</a></p>
      )}
    </div>
  );
}