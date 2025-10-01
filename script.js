const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
const searchByUrlBtn = document.getElementById('searchByUrl');
const previewSection = document.getElementById('preview');
const previewImage = document.getElementById('previewImage');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('results');

const API_BASE_URL = 'https://api.trace.moe';
const ANILIST_API = 'https://graphql.anilist.co';

uploadBox.addEventListener('click', () => fileInput.click());

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFileUpload(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

searchByUrlBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
        searchByImageUrl(url);
    } else {
        showError('Silakan masukkan URL gambar yang valid');
    }
});

function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        showPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    searchByFile(file);
}

function showPreview(imageUrl) {
    previewImage.src = imageUrl;
    previewSection.style.display = 'block';
}

async function searchByImageUrl(imageUrl) {
    try {
        showPreview(imageUrl);
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/search?url=${encodeURIComponent(imageUrl)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        hideLoading();
        displayResults(data);
    } catch (error) {
        hideLoading();
        showError('Terjadi kesalahan saat mencari anime. Pastikan URL gambar valid.');
        console.error('Error:', error);
    }
}

async function searchByFile(file) {
    try {
        showLoading();
        
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`${API_BASE_URL}/search`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        hideLoading();
        displayResults(data);
    } catch (error) {
        hideLoading();
        showError('Terjadi kesalahan saat mencari anime. Silakan coba lagi.');
        console.error('Error:', error);
    }
}

async function fetchAnimeInfo(anilistId) {
    try {
        const query = `
            query ($id: Int) {
                Media(id: $id, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    format
                    episodes
                    status
                    startDate {
                        year
                        month
                        day
                    }
                    endDate {
                        year
                        month
                        day
                    }
                    season
                    seasonYear
                    studios(isMain: true) {
                        nodes {
                            name
                        }
                    }
                    source
                    genres
                    duration
                    averageScore
                }
            }
        `;
        
        const response = await fetch(ANILIST_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: { id: anilistId }
            })
        });
        
        if (!response.ok) {
            console.error('AniList API error:', response.status);
            return null;
        }
        
        const data = await response.json();
        
        if (data.errors) {
            console.error('AniList GraphQL errors:', data.errors);
            return null;
        }
        
        return data.data?.Media || null;
    } catch (error) {
        console.error('Error fetching anime info:', error);
        return null;
    }
}

function showLoading() {
    loading.style.display = 'block';
    resultsSection.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
}

async function displayResults(data) {
    resultsSection.innerHTML = '';
    resultsSection.style.display = 'block';
    
    console.log('API Response:', data);
    
    if (data.error) {
        showError(data.error);
        return;
    }
    
    if (!data.result || data.result.length === 0) {
        showError('Tidak ada hasil ditemukan. Coba dengan gambar yang lebih jelas.');
        return;
    }
    
    const topResults = data.result.slice(0, 5);
    
    const numericIds = topResults
        .map((r, i) => ({ index: i, id: r.anilist }))
        .filter(item => typeof item.id === 'number');
    
    const animeInfoPromises = numericIds.map(item => 
        fetchAnimeInfo(item.id).then(info => ({ ...item, info }))
    );
    
    const animeInfoResults = await Promise.all(animeInfoPromises);
    
    animeInfoResults.forEach(({ index, id, info }) => {
        if (info) {
            topResults[index].anilist = {
                id: id,
                ...info
            };
        }
    });
    
    topResults.forEach((result, index) => {
        console.log(`Result ${index + 1}:`, result);
        const resultCard = createResultCard(result, index + 1);
        resultsSection.appendChild(resultCard);
    });
}

function createResultCard(result, rank) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    let title = 'Judul tidak diketahui';
    let titleEng = '';
    let titleNative = '';
    
    if (result.anilist) {
        if (typeof result.anilist === 'object' && result.anilist.title) {
            title = result.anilist.title.romaji || result.anilist.title.english || result.anilist.title.native || 'Judul tidak diketahui';
            titleEng = result.anilist.title.english || '';
            titleNative = result.anilist.title.native || '';
        } else if (typeof result.anilist === 'number') {
            title = `Anilist ID: ${result.anilist}`;
        }
    }
    
    const filename = result.filename || '';
    const episode = result.episode !== null && result.episode !== undefined ? result.episode : 'Tidak diketahui';
    const similarity = (result.similarity * 100).toFixed(2);
    const timeFrom = result.from !== undefined ? formatTime(result.from) : 'N/A';
    const timeTo = result.to !== undefined ? formatTime(result.to) : 'N/A';
    
    const resultHeader = document.createElement('div');
    resultHeader.className = 'result-header';
    
    const titleSection = document.createElement('div');
    
    const animeTitle = document.createElement('div');
    animeTitle.className = 'anime-title';
    animeTitle.textContent = `#${rank} ${title}`;
    titleSection.appendChild(animeTitle);
    
    if (titleEng && titleEng !== title) {
        const engTitle = document.createElement('div');
        engTitle.style.cssText = 'color: #666; font-size: 0.95em; margin-top: 5px;';
        engTitle.textContent = `📝 ${titleEng}`;
        titleSection.appendChild(engTitle);
    }
    
    if (titleNative && titleNative !== title) {
        const nativeTitle = document.createElement('div');
        nativeTitle.style.cssText = 'color: #666; font-size: 0.85em; margin-top: 3px;';
        nativeTitle.textContent = `🇯🇵 ${titleNative}`;
        titleSection.appendChild(nativeTitle);
    }
    
    if (filename) {
        const fileInfo = document.createElement('div');
        fileInfo.style.cssText = 'color: #888; font-size: 0.8em; margin-top: 5px;';
        fileInfo.textContent = `📁 ${filename}`;
        titleSection.appendChild(fileInfo);
    }
    
    const similarityBadge = document.createElement('div');
    similarityBadge.className = 'similarity-badge';
    similarityBadge.textContent = `${similarity}% Cocok`;
    
    resultHeader.appendChild(titleSection);
    resultHeader.appendChild(similarityBadge);
    card.appendChild(resultHeader);
    
    if (result.anilist && typeof result.anilist === 'object' && result.anilist.title) {
        const spoilerBtn = document.createElement('button');
        spoilerBtn.className = 'spoiler-btn';
        spoilerBtn.innerHTML = '<span class="icon">▼</span><span>Tampilkan Informasi Anime</span>';
        card.appendChild(spoilerBtn);
        
        const infoSection = document.createElement('div');
        infoSection.className = 'anime-info-section hidden';
        infoSection.innerHTML = '<h3>Informasi Anime</h3>';
        
        const anime = result.anilist;
        
        const infoGrid = document.createElement('div');
        infoGrid.className = 'info-grid';
        
        if (anime.format) {
            const typeDiv = document.createElement('div');
            typeDiv.innerHTML = `<strong>Tipe:</strong> ${anime.format}`;
            infoGrid.appendChild(typeDiv);
        }
        
        if (anime.episodes != null) {
            const episodesDiv = document.createElement('div');
            episodesDiv.innerHTML = `<strong>Episodes:</strong> ${anime.episodes}`;
            infoGrid.appendChild(episodesDiv);
        }
        
        if (anime.status) {
            const statusDiv = document.createElement('div');
            statusDiv.innerHTML = `<strong>Status:</strong> ${formatStatus(anime.status)}`;
            infoGrid.appendChild(statusDiv);
        }
        
        const startStr = formatDate(anime.startDate);
        const endStr = formatDate(anime.endDate);
        if (startStr !== 'N/A' || endStr !== 'N/A') {
            const airedDiv = document.createElement('div');
            airedDiv.innerHTML = `<strong>Ditayangkan:</strong> ${startStr} - ${endStr}`;
            infoGrid.appendChild(airedDiv);
        }
        
        if (anime.season && anime.seasonYear) {
            const seasonDiv = document.createElement('div');
            const seasonMap = {
                'WINTER': 'Winter',
                'SPRING': 'Spring',
                'SUMMER': 'Summer',
                'FALL': 'Fall'
            };
            seasonDiv.innerHTML = `<strong>Musim Tayang:</strong> ${seasonMap[anime.season] || anime.season} ${anime.seasonYear}`;
            infoGrid.appendChild(seasonDiv);
        }
        
        if (anime.studios && anime.studios.nodes && anime.studios.nodes.length > 0) {
            const studiosDiv = document.createElement('div');
            const studioNames = anime.studios.nodes.map(s => s.name).join(', ');
            studiosDiv.innerHTML = `<strong>Studio:</strong> ${studioNames}`;
            infoGrid.appendChild(studiosDiv);
        }
        
        if (anime.source) {
            const sourceDiv = document.createElement('div');
            sourceDiv.innerHTML = `<strong>Sumber:</strong> ${formatSource(anime.source)}`;
            infoGrid.appendChild(sourceDiv);
        }
        
        if (anime.genres && anime.genres.length > 0) {
            const genresDiv = document.createElement('div');
            genresDiv.innerHTML = `<strong>Genre:</strong> ${anime.genres.join(', ')}`;
            infoGrid.appendChild(genresDiv);
        }
        
        if (anime.duration != null) {
            const durationDiv = document.createElement('div');
            durationDiv.innerHTML = `<strong>Durasi:</strong> ${anime.duration} menit per episode`;
            infoGrid.appendChild(durationDiv);
        }
        
        if (anime.averageScore != null) {
            const ratingDiv = document.createElement('div');
            ratingDiv.innerHTML = `<strong>Rating:</strong> ${anime.averageScore}/100`;
            infoGrid.appendChild(ratingDiv);
        }
        
        infoSection.appendChild(infoGrid);
        card.appendChild(infoSection);
        
        spoilerBtn.addEventListener('click', function() {
            infoSection.classList.toggle('hidden');
            spoilerBtn.classList.toggle('active');
            const isHidden = infoSection.classList.contains('hidden');
            spoilerBtn.innerHTML = isHidden 
                ? '<span class="icon">▼</span><span>Tampilkan Informasi Anime</span>'
                : '<span class="icon">▼</span><span>Sembunyikan Informasi Anime</span>';
        });
    }
    
    const episodeInfo = document.createElement('div');
    episodeInfo.className = 'result-info';
    episodeInfo.innerHTML = '<strong>📺 Episode Ditemukan:</strong> ';
    episodeInfo.appendChild(document.createTextNode(episode));
    card.appendChild(episodeInfo);
    
    const timeInfo = document.createElement('div');
    timeInfo.className = 'result-info';
    timeInfo.innerHTML = '<strong>⏱️ Waktu di Video:</strong> ';
    timeInfo.appendChild(document.createTextNode(`${timeFrom} - ${timeTo}`));
    card.appendChild(timeInfo);
    
    if (result.video) {
        const videoPreview = document.createElement('div');
        videoPreview.className = 'video-preview';
        
        const video = document.createElement('video');
        video.controls = true;
        video.muted = true;
        video.loop = true;
        
        const source = document.createElement('source');
        source.src = result.video;
        source.type = 'video/mp4';
        
        video.appendChild(source);
        video.appendChild(document.createTextNode('Browser Anda tidak mendukung video.'));
        videoPreview.appendChild(video);
        card.appendChild(videoPreview);
    }
    
    return card;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateObj) {
    if (!dateObj || !dateObj.year) return 'N/A';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    if (dateObj.day && dateObj.month) {
        return `${months[dateObj.month - 1]} ${dateObj.day}, ${dateObj.year}`;
    } else if (dateObj.month) {
        return `${months[dateObj.month - 1]} ${dateObj.year}`;
    } else {
        return `${dateObj.year}`;
    }
}

function formatStatus(status) {
    const statusMap = {
        'FINISHED': 'Selesai Tayang',
        'RELEASING': 'Sedang Tayang',
        'NOT_YET_RELEASED': 'Belum Tayang',
        'CANCELLED': 'Dibatalkan',
        'HIATUS': 'Hiatus'
    };
    return statusMap[status] || status;
}

function formatSource(source) {
    const sourceMap = {
        'ORIGINAL': 'Original',
        'MANGA': 'Manga',
        'LIGHT_NOVEL': 'Light Novel',
        'VISUAL_NOVEL': 'Visual Novel',
        'VIDEO_GAME': 'Video Game',
        'OTHER': 'Lainnya',
        'NOVEL': 'Novel',
        'DOUJINSHI': 'Doujinshi',
        'ANIME': 'Anime',
        'WEB_NOVEL': 'Web Novel',
        'LIVE_ACTION': 'Live Action',
        'GAME': 'Game',
        'COMIC': 'Comic',
        'MULTIMEDIA_PROJECT': 'Multimedia Project',
        'PICTURE_BOOK': 'Picture Book'
    };
    return sourceMap[source] || source;
}

function showError(message) {
    resultsSection.innerHTML = '';
    resultsSection.style.display = 'block';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    
    const errorText = document.createElement('p');
    errorText.textContent = message;
    
    errorDiv.appendChild(errorText);
    resultsSection.appendChild(errorDiv);
}

function updateDateTime() {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const dateTimeString = `${dayName}, ${date} ${month} ${year} - ${hours}:${minutes}:${seconds}`;
    
    document.getElementById('currentDateTime').textContent = dateTimeString;
}

updateDateTime();
setInterval(updateDateTime, 1000);
