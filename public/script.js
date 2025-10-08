let selectedFile = null;

const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const previewBox = document.getElementById('previewBox');
const previewImage = document.getElementById('previewImage');
const btnRemove = document.getElementById('btnRemove');
const btnSearch = document.getElementById('btnSearch');
const searchText = document.getElementById('searchText');
const loadingText = document.getElementById('loadingText');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const uploadContent = document.getElementById('uploadContent');
const scraperSelect = document.getElementById('scraperSelect');
const loadingContainer = document.getElementById('loadingContainer');
const loadingBar = document.getElementById('loadingBar');
const loadingPercentage = document.getElementById('loadingPercentage');

function animateProgressBar() {
    let progress = 0;
    loadingContainer.style.display = 'block';
    loadingBar.style.width = '0%';
    loadingPercentage.textContent = '0%';
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 95) {
            progress = 95;
        }
        loadingBar.style.width = progress + '%';
        loadingPercentage.textContent = Math.floor(progress) + '%';
    }, 200);
    
    return {
        complete: () => {
            clearInterval(interval);
            loadingBar.style.width = '100%';
            loadingPercentage.textContent = '100%';
            setTimeout(() => {
                loadingContainer.style.display = 'none';
            }, 500);
        },
        stop: () => {
            clearInterval(interval);
            loadingContainer.style.display = 'none';
        }
    };
}

function handleFile(file) {
    selectedFile = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadContent.style.display = 'none';
        previewBox.style.display = 'block';
        btnSearch.disabled = false;
    };
    
    reader.readAsDataURL(file);
}

function resetToUploadTab() {
    const videos = document.querySelectorAll('.result-video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
        video.src = '';
    });
    
    selectedFile = null;
    previewBox.style.display = 'none';
    uploadContent.style.display = 'block';
    btnSearch.disabled = true;
    fileInput.value = '';
    resultsSection.style.display = 'none';
    resultsContainer.innerHTML = '';
}

async function displayTraceMoeResults(results) {
    resultsContainer.innerHTML = '';
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Tidak ada hasil ditemukan.</p>';
        resultsSection.style.display = 'block';
        return;
    }

    const uniqueResults = [];
    const seen = new Set();
    
    for (const result of results) {
        const key = `${result.anilist || result.filename}-${result.episode || 'unknown'}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(result);
        }
        if (uniqueResults.length >= 5) break;
    }
    
    const topResults = uniqueResults;
    
    for (const result of topResults) {
        const similarity = (result.similarity * 100).toFixed(2);
        const episode = result.episode || '?';
        const timestampFrom = formatTime(result.from);
        const timestampTo = formatTime(result.to);
        const duration = formatTime(result.duration || 0);
        const accuracyInfo = getAccuracyLabel(parseFloat(similarity));
        
        let animeData = null;
        if (result.anilist) {
            animeData = await fetchAnilistData(result.anilist);
        }
        
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const cardId = `card-${Math.random().toString(36).substr(2, 9)}`;
        
        let cardHTML = `
            <div class="result-media">
                ${result.video ? `
                    <video class="result-video" controls muted loop playsinline>
                        <source src="${result.video}" type="video/mp4">
                    </video>
                ` : result.image ? `
                    <img src="${result.image}" alt="Scene" class="result-thumbnail">
                ` : ''}
            </div>
            <div class="result-content">
                <div class="result-summary">
                    <div class="filename">${result.filename}</div>
                    <div class="timestamp-row">
                        <span class="timestamp">⏱️ ${timestampFrom}/${duration}</span>
                        <div class="similarity-container">
                            <span class="similarity-badge">✓ ${similarity}%</span>
                            <span class="accuracy-label ${accuracyInfo.class}">${accuracyInfo.text}</span>
                        </div>
                    </div>
                </div>
        `;
        
        if (animeData) {
            const titles = [
                animeData.title?.native,
                animeData.title?.romaji,
                animeData.title?.english
            ].filter(Boolean);
            
            const allTitles = [...new Set([...titles, ...(animeData.synonyms || [])])];
            
            const studios = animeData.studios?.nodes?.map(s => s.name).join(', ') || 'Unknown';
            const genres = animeData.genres?.join(', ') || 'Unknown';
            
            const startDateFormatted = formatDateIndonesian(animeData.startDate);
            const endDateFormatted = formatDateIndonesian(animeData.endDate);
            
            const status = getStatusIndonesian(animeData.status);
            const season = animeData.season && animeData.seasonYear ? 
                `${getSeasonIndonesian(animeData.season)} ${animeData.seasonYear}` : '';
            const source = getSourceIndonesian(animeData.source);
            const rating = animeData.averageScore ? `${animeData.averageScore}/100` : 'N/A';
            const coverImage = animeData.coverImage?.extraLarge || animeData.coverImage?.large || '';
            
            cardHTML += `
                <button class="spoiler-btn" onclick="toggleSpoiler('${cardId}')">
                    <span class="spoiler-icon">▼</span> Sembunyikan Informasi Anime
                </button>
                <div class="anime-info spoiler-content" id="${cardId}" style="display: none;">
                    <h3 style="margin: 0 0 15px 0; color: var(--primary-color); font-size: 1.1em;">Informasi Anime</h3>
                    
                    <div class="anime-info-container">
                        ${coverImage ? `
                            <div class="anime-cover">
                                <img src="${coverImage}" alt="Cover Anime" class="cover-image">
                            </div>
                        ` : ''}
                        
                        <div class="anime-details">
                            <div class="info-line"><strong>Tipe:</strong> ${animeData.format || 'Unknown'}</div>
                            ${animeData.episodes ? `<div class="info-line"><strong>Episodes:</strong> ${animeData.episodes}</div>` : ''}
                            <div class="info-line"><strong>Status:</strong> ${status}</div>
                            ${startDateFormatted || endDateFormatted ? `<div class="info-line"><strong>Ditayangkan:</strong> ${startDateFormatted}${endDateFormatted ? ' - ' + endDateFormatted : ''}</div>` : ''}
                            ${season ? `<div class="info-line"><strong>Musim Tayang:</strong> ${season}</div>` : ''}
                            <div class="info-line"><strong>Studio:</strong> ${studios}</div>
                            <div class="info-line"><strong>Sumber:</strong> ${source}</div>
                            <div class="info-line"><strong>Genre:</strong> ${genres}</div>
                            ${animeData.duration ? `<div class="info-line"><strong>Durasi:</strong> ${animeData.duration} menit per episode</div>` : ''}
                            <div class="info-line"><strong>Rating:</strong> ${rating}</div>
                        </div>
                    </div>
                    
                    ${allTitles.length > 0 ? `
                        <div class="alias-section">
                            <strong style="color: var(--primary-color);">📋 Judul Alternatif:</strong>
                            <div class="alias-list">
                                ${allTitles.map(alias => `<div class="alias">${alias}</div>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${animeData.externalLinks?.length ? `
                        <div class="external-links">
                            <strong style="color: var(--primary-color);">🔗 Link Eksternal:</strong>
                            <div class="links-container">
                                ${animeData.externalLinks.slice(0, 5).map(link => 
                                    `<a href="${link.url}" target="_blank" class="ext-link">${link.site}</a>`
                                ).join('')}
                                ${animeData.siteUrl ? `<a href="${animeData.siteUrl}" target="_blank" class="ext-link">AniList</a>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        cardHTML += `</div>`;
        card.innerHTML = cardHTML;
        resultsContainer.appendChild(card);
    }

    resultsSection.style.display = 'block';
}

async function displaySauceNAOResults(results) {
    resultsContainer.innerHTML = '';
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Tidak ada hasil ditemukan.</p>';
        resultsSection.style.display = 'block';
        return;
    }

    const uniqueResults = [];
    const seen = new Set();
    
    for (const result of results) {
        const data = result.data || {};
        const key = `${data.title || data.source}-${data.author || data.member_name}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(result);
        }
        if (uniqueResults.length >= 5) break;
    }
    
    const topResults = uniqueResults;
    
    for (const result of topResults) {
        const similarity = result.header?.similarity || 0;
        const data = result.data || {};
        const accuracyInfo = getAccuracyLabel(parseFloat(similarity));
        
        const card = document.createElement('div');
        card.className = 'result-card';
        const cardId = `card-${Math.random().toString(36).substr(2, 9)}`;
        
        let cardHTML = `
            <div class="result-media">
                ${result.header?.thumbnail ? `
                    <img src="${result.header.thumbnail}" alt="Result" class="result-thumbnail">
                ` : ''}
            </div>
            <div class="result-content">
                <div class="result-summary">
                    <div class="filename">${data.title || data.source || 'Unknown'}</div>
                    <div class="timestamp-row">
                        <span class="timestamp">🎨 ${data.author || data.member_name || 'Unknown Artist'}</span>
                        <div class="similarity-container">
                            <span class="similarity-badge">✓ ${similarity}%</span>
                            <span class="accuracy-label ${accuracyInfo.class}">${accuracyInfo.text}</span>
                        </div>
                    </div>
                </div>
                <button class="spoiler-btn" onclick="toggleSpoiler('${cardId}')">
                    <span class="spoiler-icon">▼</span> Detail
                </button>
                <div class="anime-info spoiler-content" id="${cardId}" style="display: none;">
                    ${data.title ? `<div class="anime-title">${data.title}</div>` : ''}
                    ${data.part ? `<div class="info-line">📖 ${data.part}</div>` : ''}
                    ${data.year ? `<div class="info-line">📅 ${data.year}</div>` : ''}
                    ${data.est_time ? `<div class="info-line">⏱️ ${data.est_time}</div>` : ''}
                    ${data.author || data.member_name ? `<div class="info-line"><strong>👤 Artist:</strong> ${data.author || data.member_name}</div>` : ''}
                    ${data.material || data.source ? `<div class="info-line"><strong>📚 Source:</strong> ${data.material || data.source}</div>` : ''}
                    ${data.characters ? `<div class="info-line"><strong>👥 Characters:</strong> ${data.characters}</div>` : ''}
                    ${result.header?.index_name ? `<div class="info-line"><strong>🗂️ Database:</strong> ${result.header.index_name}</div>` : ''}
                    ${data.ext_urls?.length ? `
                        <div class="external-links">
                            <strong>🔗 External Links:</strong>
                            <div class="links-container">
                                ${data.ext_urls.slice(0, 5).map(url => 
                                    `<a href="${url}" target="_blank" class="ext-link">${new URL(url).hostname}</a>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        card.innerHTML = cardHTML;
        resultsContainer.appendChild(card);
    }

    resultsSection.style.display = 'block';
}

async function fetchAnilistData(anilistId) {
    try {
        const query = `
        query ($id: Int) {
            Media (id: $id, type: ANIME) {
                title {
                    romaji
                    english
                    native
                }
                synonyms
                format
                episodes
                duration
                status
                season
                seasonYear
                source
                averageScore
                coverImage {
                    extraLarge
                    large
                }
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
                genres
                studios {
                    nodes {
                        name
                    }
                }
                externalLinks {
                    site
                    url
                }
                siteUrl
            }
        }`;
        
        const response = await fetch('https://graphql.anilist.co', {
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
        
        const data = await response.json();
        return data.data?.Media || null;
    } catch (error) {
        return null;
    }
}

function getStatusIndonesian(status) {
    const statusMap = {
        'FINISHED': 'Selesai Tayang',
        'RELEASING': 'Sedang Tayang',
        'NOT_YET_RELEASED': 'Belum Tayang',
        'CANCELLED': 'Dibatalkan',
        'HIATUS': 'Hiatus'
    };
    return statusMap[status] || status;
}

function getSeasonIndonesian(season) {
    const seasonMap = {
        'WINTER': 'Winter',
        'SPRING': 'Spring',
        'SUMMER': 'Summer',
        'FALL': 'Fall'
    };
    return seasonMap[season] || season;
}

function getSourceIndonesian(source) {
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

function formatDateIndonesian(dateObj) {
    if (!dateObj || !dateObj.year) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = dateObj.month ? months[dateObj.month - 1] : '';
    const day = dateObj.day || '';
    return `${month} ${day}, ${dateObj.year}`.trim();
}

function getAccuracyLabel(similarity) {
    if (similarity >= 98) {
        return { text: '100% Akurat', class: 'accuracy-perfect' };
    } else if (similarity >= 90) {
        return { text: 'Cocok', class: 'accuracy-high' };
    } else if (similarity >= 80) {
        return { text: 'Tidak Cocok', class: 'accuracy-low' };
    } else {
        return { text: 'Tidak Cocok Sekali', class: 'accuracy-very-low' };
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateDateTime() {
    const options = {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('id-ID', options);
    document.getElementById('datetime').textContent = formatter.format(now);
}

function updateBackground() {
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const hour = jakartaTime.getHours();
    
    document.body.classList.remove('bg-morning', 'bg-afternoon', 'bg-evening', 'bg-night');
    
    if (hour >= 5 && hour < 12) {
        document.body.classList.add('bg-morning');
    } else if (hour >= 12 && hour < 18) {
        document.body.classList.add('bg-afternoon');
    } else if (hour >= 18 && hour < 21) {
        document.body.classList.add('bg-evening');
    } else {
        document.body.classList.add('bg-night');
    }
}

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
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

btnRemove.addEventListener('click', () => {
    resetToUploadTab();
});

btnSearch.addEventListener('click', async () => {
    if (!selectedFile) return;

    btnSearch.disabled = true;
    searchText.style.display = 'none';
    loadingText.style.display = 'inline';
    resultsSection.style.display = 'none';
    
    const progressBar = animateProgressBar();

    try {
        const scraper = scraperSelect.value;
        
        if (scraper === 'tracemoe') {
            await searchTraceMoe();
        } else if (scraper === 'saucenao') {
            await searchSauceNAO();
        }
        
        progressBar.complete();
    } catch (error) {
        console.error('Error:', error);
        progressBar.stop();
        alert('Terjadi kesalahan saat mencari anime. Silakan coba lagi.');
    } finally {
        btnSearch.disabled = false;
        searchText.style.display = 'inline';
        loadingText.style.display = 'none';
    }
});

async function searchTraceMoe() {
    console.log('Searching with uploaded file');
    const formData = new FormData();
    formData.append('image', selectedFile);
    const response = await fetch('https://api.trace.moe/search', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    console.log('Trace.moe API response:', data);
    
    if (data.error) {
        alert(`Error dari Trace.moe: ${data.error}`);
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Tidak ada hasil ditemukan.</p>';
        resultsSection.style.display = 'block';
        return;
    }
    
    if (!data.result || data.result.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Tidak ada hasil ditemukan.</p>';
        resultsSection.style.display = 'block';
        return;
    }
    
    displayTraceMoeResults(data.result);
}

async function searchSauceNAO() {
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    const response = await fetch('https://saucenao.com/search.php?output_type=2&numres=5', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    displaySauceNAOResults(data.results);
}

function toggleSpoiler(id) {
    const content = document.getElementById(id);
    const btn = content.previousElementSibling;
    const icon = btn.querySelector('.spoiler-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
    }
}

window.toggleSpoiler = toggleSpoiler;

updateDateTime();
setInterval(updateDateTime, 1000);

updateBackground();
setInterval(updateBackground, 60000);

const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
