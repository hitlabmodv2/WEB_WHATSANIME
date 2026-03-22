const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 5000;

const VISITS_FILE = path.join(__dirname, 'visits.json');

function loadVisits() {
  try {
    if (fs.existsSync(VISITS_FILE)) {
      const data = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
      return data.total || 0;
    }
  } catch (e) {}
  return 0;
}

function saveVisits(total) {
  try {
    fs.writeFileSync(VISITS_FILE, JSON.stringify({ total }), 'utf8');
  } catch (e) {}
}

let totalVisits = loadVisits();
const sseClients = new Set();

function broadcastStats() {
  const data = JSON.stringify({ online: sseClients.size, total: totalVisits });
  for (const client of sseClients) {
    client.write(`data: ${data}\n\n`);
  }
}

app.use(express.static('public', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/stats', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  totalVisits++;
  saveVisits(totalVisits);
  sseClients.add(res);
  broadcastStats();

  req.on('close', () => {
    sseClients.delete(res);
    broadcastStats();
  });
});

app.post('/proxy-image', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'URL does not point to an image' });
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.set('Content-Type', contentType);
    res.send(buffer);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
