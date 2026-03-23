const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
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

const serverStartTime = Date.now();
let totalRequests = 0;

app.use((req, res, next) => {
  totalRequests++;
  next();
});

app.get('/api/server-info', (req, res) => {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);
  const ramUsedMB = Math.round(usedMem / 1024 / 1024);
  const ramTotalMB = Math.round(totalMem / 1024 / 1024);

  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  const load = os.loadavg();
  const cpus = os.cpus();
  const cpuCount = cpus.length;
  const cpuPercent = Math.min(((load[0] / cpuCount) * 100).toFixed(1), 100);
  const cpuModel = cpus[0]?.model?.trim() || 'Unknown';

  const heap = process.memoryUsage();
  const heapUsedMB = Math.round(heap.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(heap.heapTotal / 1024 / 1024);
  const heapPercent = ((heap.heapUsed / heap.heapTotal) * 100).toFixed(1);
  const rssMB = Math.round(heap.rss / 1024 / 1024);

  res.json({
    ram: { percent: parseFloat(ramPercent), usedMB: ramUsedMB, totalMB: ramTotalMB, freeMB: Math.round(os.freemem() / 1024 / 1024) },
    cpu: { percent: parseFloat(cpuPercent), count: cpuCount, model: cpuModel, load1: load[0].toFixed(2), load5: load[1].toFixed(2) },
    heap: { percent: parseFloat(heapPercent), usedMB: heapUsedMB, totalMB: heapTotalMB, rssMB },
    uptime: { hours, minutes, seconds },
    totalRequests,
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),
    pid: process.pid
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

app.post('/api/translate', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });
    const clean = text.replace(/<[^>]*>/g, '').substring(0, 500);
    const encoded = encodeURIComponent(clean);
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|id`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.responseStatus === 200) {
      res.json({ translated: data.responseData.translatedText });
    } else {
      res.status(500).json({ error: 'Translation failed' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Translation error' });
  }
});

const ANIME_SLUGS = {
  naruto:         { name: 'Naruto', emoji: '🍃' },
  narutoshippuuden: { name: 'Naruto Shippuden', emoji: '🌀' },
  one_piece:      { name: 'One Piece', emoji: '🏴‍☠️' },
  bleach:         { name: 'Bleach', emoji: '⚔️' },
  shingeki_no_kyojin: { name: 'Attack on Titan', emoji: '💥' },
  kimetsu_no_yaiba: { name: 'Demon Slayer', emoji: '🔥' },
  jujutsu_kaisen: { name: 'Jujutsu Kaisen', emoji: '🏙️' },
  death_note:     { name: 'Death Note', emoji: '📓' },
  fullmetal_alchemist_brotherhood: { name: 'FMA Brotherhood', emoji: '⚙️' },
  dragon_ball_z:  { name: 'Dragon Ball Z', emoji: '🐉' },
  fairy_tail:     { name: 'Fairy Tail', emoji: '✨' },
  sword_art_online: { name: 'SAO', emoji: '🎮' },
  tokyo_ghoul:    { name: 'Tokyo Ghoul', emoji: '👁️' },
  black_clover_tv: { name: 'Black Clover', emoji: '🍀' },
  boruto_naruto_next_generations: { name: 'Boruto', emoji: '🌿' },
  dragon_ball_super: { name: 'Dragon Ball Super', emoji: '⭐' },
  one_punch_man:  { name: 'One Punch Man', emoji: '👊' },
  hunter_x_hunter: { name: 'Hunter x Hunter', emoji: '🎯' },
  overlord:       { name: 'Overlord', emoji: '💀' },
  tensei_shitara_slime_datta_ken: { name: 'TenSura', emoji: '🟦' },
  kono_subarashii_sekai_ni_shukufuku_wo: { name: 'KonoSuba', emoji: '💧' },
  re_zero_kara_hajimeru_isekai_seikatsu: { name: 'Re:Zero', emoji: '🔄' },
  mob_psycho_100: { name: 'Mob Psycho 100', emoji: '💫' },
  chainsaw_man:   { name: 'Chainsaw Man', emoji: '🪚' },
  vinland_saga:   { name: 'Vinland Saga', emoji: '⚓' },
  boku_no_hero_academia: { name: 'My Hero Academia', emoji: '🦸' },
  oshi_no_ko:     { name: 'Oshi no Ko', emoji: '⭐' },
  bocchi_the_rock: { name: 'Bocchi the Rock', emoji: '🎸' },
  spy_x_family:   { name: 'Spy x Family', emoji: '🕵️' },
  blue_lock:      { name: 'Blue Lock', emoji: '⚽' },
  dr_stone:       { name: 'Dr. Stone', emoji: '🧪' },
  ore_dake_level_up_na_ken: { name: 'Solo Leveling', emoji: '⬆️' },
  dandadan:       { name: 'Dandadan', emoji: '👻' },
  kaijuu_8_gou:   { name: 'Kaiju No. 8', emoji: '🦕' },
  sousou_no_frieren: { name: 'Frieren', emoji: '🧝' },
  mushoku_tensei_isekai_ittara_honki_dasu: { name: 'Mushoku Tensei', emoji: '📖' },
  mashle:         { name: 'Mashle', emoji: '🍫' },
  kusuriya_no_hitorigoto: { name: 'Apothecary Diaries', emoji: '🌸' },
  toaru_kagaku_no_railgun: { name: 'Railgun', emoji: '⚡' },
};

async function fetchAnimeSongs(slug) {
  const url = `https://api.animethemes.moe/anime/${slug}?include=animethemes.animethemeentries.videos.audio,animethemes.song.artists`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'WhatAnimeFinder/1.0 (anime music player)', 'Accept': 'application/json' }
  });
  if (!response.ok) return null;
  const data = await response.json();
  const anime = data.anime;
  if (!anime) return null;
  const info = ANIME_SLUGS[slug] || {};
  const songs = [];
  for (const theme of anime.animethemes || []) {
    const entry = (theme.animethemeentries || [])[0];
    if (!entry) continue;
    const video = (entry.videos || [])[0];
    if (!video || !video.audio) continue;
    songs.push({
      id: theme.id, type: theme.type, sequence: theme.sequence, slug: theme.slug,
      title: theme.song ? theme.song.title : theme.slug,
      artist: theme.song && theme.song.artists && theme.song.artists.length
        ? theme.song.artists.map(a => a.name).join(', ') : '—',
      episodes: entry.episodes || '',
      audioUrl: video.audio.link,
      animeName: info.name || anime.name,
      animeEmoji: info.emoji || '🎵'
    });
  }
  return { animeName: info.name || anime.name, songs };
}

app.get('/api/anime-music', async (req, res) => {
  try {
    const slug = req.query.anime || 'naruto';
    const result = await fetchAnimeSongs(slug);
    if (!result) return res.status(404).json({ error: 'Anime not found' });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch anime music' });
  }
});

app.get('/api/anime-music-mix', async (req, res) => {
  try {
    const mixSlugs = [
      'naruto', 'narutoshippuuden', 'one_piece', 'bleach',
      'shingeki_no_kyojin', 'kimetsu_no_yaiba', 'jujutsu_kaisen',
      'death_note', 'fullmetal_alchemist_brotherhood', 'dragon_ball_z',
      'fairy_tail', 'sword_art_online', 'tokyo_ghoul', 'dragon_ball_super',
      'oshi_no_ko', 'chainsaw_man', 'boku_no_hero_academia',
      'hunter_x_hunter', 'black_clover_tv', 'vinland_saga',
      'mob_psycho_100', 're_zero_kara_hajimeru_isekai_seikatsu',
      'one_punch_man', 'overlord', 'tensei_shitara_slime_datta_ken',
      'kono_subarashii_sekai_ni_shukufuku_wo', 'bocchi_the_rock',
      'spy_x_family', 'blue_lock', 'dr_stone',
      'ore_dake_level_up_na_ken', 'dandadan', 'kaijuu_8_gou',
      'sousou_no_frieren', 'mushoku_tensei_isekai_ittara_honki_dasu',
      'mashle', 'kusuriya_no_hitorigoto', 'toaru_kagaku_no_railgun'
    ];
    const results = await Promise.allSettled(mixSlugs.map(s => fetchAnimeSongs(s)));
    let allSongs = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value && r.value.songs) {
        const songs = r.value.songs.slice(0, 5);
        allSongs = allSongs.concat(songs);
      }
    }
    for (let i = allSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
    }
    res.json({ animeName: '🎲 Mix Semua Anime', songs: allSongs });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch mix' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
