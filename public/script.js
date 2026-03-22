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
const urlContent = document.getElementById('urlContent');
const urlInput = document.getElementById('urlInput');
const urlLoadBtn = document.getElementById('urlLoadBtn');
const loadingContainer = document.getElementById('loadingContainer');
const loadingBar = document.getElementById('loadingBar');
const loadingPercentage = document.getElementById('loadingPercentage');

let currentInputMethod = 'upload';

function animateProgressBar() {
    let progress = 0;
    loadingContainer.style.display = 'block';
    loadingBar.style.width = '0%';
    loadingPercentage.textContent = '0%';
    
    const interval = setInterval(() => {
        if (progress < 30) {
            progress += Math.random() * 3 + 2;
        } else if (progress < 60) {
            progress += Math.random() * 2 + 1;
        } else if (progress < 90) {
            progress += Math.random() * 1.5 + 0.5;
        } else {
            progress += Math.random() * 0.5;
        }
        
        if (progress > 95) {
            progress = 95;
        }
        
        loadingBar.style.width = progress + '%';
        loadingPercentage.textContent = Math.floor(progress) + '%';
    }, 80);
    
    return {
        complete: () => {
            clearInterval(interval);
            let finalProgress = parseFloat(loadingBar.style.width) || 0;
            
            const completeInterval = setInterval(() => {
                finalProgress += (100 - finalProgress) * 0.3;
                if (finalProgress >= 99.5) {
                    finalProgress = 100;
                    clearInterval(completeInterval);
                }
                loadingBar.style.width = finalProgress + '%';
                loadingPercentage.textContent = Math.floor(finalProgress) + '%';
            }, 30);
            
            setTimeout(() => {
                clearInterval(completeInterval);
                loadingBar.style.width = '100%';
                loadingPercentage.textContent = '100%';
                setTimeout(() => {
                    loadingContainer.style.display = 'none';
                    loadingBar.style.width = '0%';
                    loadingPercentage.textContent = '0%';
                }, 500);
            }, 300);
        },
        stop: () => {
            clearInterval(interval);
            loadingContainer.style.display = 'none';
            loadingBar.style.width = '0%';
            loadingPercentage.textContent = '0%';
        }
    };
}

function handleFile(file) {
    selectedFile = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadContent.style.display = 'none';
        urlContent.style.display = 'none';
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
    if (currentInputMethod === 'upload') {
        uploadContent.style.display = 'block';
    } else {
        urlContent.style.display = 'block';
    }
    btnSearch.disabled = true;
    fileInput.value = '';
    urlInput.value = '';
    resultsSection.style.display = 'none';
    resultsContainer.innerHTML = '';
}

function switchTab(tabName, targetBtn) {
    currentInputMethod = tabName;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (targetBtn) targetBtn.classList.add('active');
    
    uploadContent.classList.remove('active');
    urlContent.classList.remove('active');
    
    if (tabName === 'upload') {
        uploadContent.classList.add('active');
        uploadContent.style.display = 'block';
        urlContent.style.display = 'none';
    } else {
        urlContent.classList.add('active');
        urlContent.style.display = 'block';
        uploadContent.style.display = 'none';
    }
    
    resetToUploadTab();
}

async function loadImageFromUrl() {
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Masukkan URL gambar terlebih dahulu!');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL harus dimulai dengan http:// atau https://');
        return;
    }
    
    try {
        urlLoadBtn.disabled = true;
        urlLoadBtn.innerHTML = '<span>⏳ Memuat...</span>';
        
        const response = await fetch('/proxy-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Gagal memuat gambar dari URL!');
            urlLoadBtn.disabled = false;
            urlLoadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>Muat Gambar`;
            return;
        }
        
        const blob = await response.blob();
        const file = new File([blob], 'image-from-url.jpg', { type: blob.type });
        handleFile(file);
        
        urlLoadBtn.disabled = false;
        urlLoadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>Muat Gambar`;
    } catch (error) {
        console.error('Error loading image:', error);
        alert('Gagal memuat gambar dari URL. Pastikan URL valid dan dapat diakses!');
        urlLoadBtn.disabled = false;
        urlLoadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>Muat Gambar`;
    }
}

const animeSitesIndo = [
    { name: 'Samehadaku', url: 'https://samehadaku.li/?s=', icon: '📺', bg: 'linear-gradient(135deg,#ef4444,#dc2626)' },
    { name: 'Otakudesu', url: 'https://otakudesu.cloud/?s=', icon: '🌟', bg: 'linear-gradient(135deg,#f97316,#ea580c)' },
    { name: 'Anichin', url: 'https://anichin.vip/?s=', icon: '🎬', bg: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
    { name: 'Kusonime', url: 'https://kusonime.com/?s=', icon: '📦', bg: 'linear-gradient(135deg,#14b8a6,#0d9488)' },
    { name: 'Animeindo', url: 'https://anime-indo.net/?s=', icon: '🎯', bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
    { name: 'Anoboy', url: 'https://anoboy.be/?s=', icon: '🎪', bg: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
    { name: 'Nimegami', url: 'https://nimegami.id/?s=', icon: '💾', bg: 'linear-gradient(135deg,#10b981,#059669)' },
    { name: 'Kuramanime', url: 'https://kuramanime.net/?s=', icon: '🦊', bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    { name: 'Layaranime', url: 'https://layaranime.com/?s=', icon: '🎞️', bg: 'linear-gradient(135deg,#ec4899,#db2777)' },
    { name: 'Neonime', url: 'https://neonime.fun/?s=', icon: '✨', bg: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
    { name: 'Oploverz', url: 'https://oploverz.asia/?s=', icon: '🎮', bg: 'linear-gradient(135deg,#f43f5e,#e11d48)' },
    { name: 'Anikyojin', url: 'https://anikyojin.net/?s=', icon: '⚡', bg: 'linear-gradient(135deg,#84cc16,#65a30d)' }
];

function generateAnimeUrl(baseUrl, title) {
    const searchQuery = encodeURIComponent(title?.romaji || title?.english || title?.native || '');
    return baseUrl + searchQuery;
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
    
    const animeDataPromises = topResults.map(result => 
        result.anilist ? fetchAnilistData(result.anilist) : Promise.resolve(null)
    );
    
    const allAnimeData = await Promise.all(animeDataPromises);
    
    for (let i = 0; i < topResults.length; i++) {
        const result = topResults[i];
        const animeData = allAnimeData[i];
        
        const similarity = (result.similarity * 100).toFixed(2);
        const episode = result.episode || '?';
        const timestampFrom = formatTime(result.from);
        const timestampTo = formatTime(result.to);
        const duration = formatTime(result.duration || 0);
        const accuracyInfo = getAccuracyLabel(parseFloat(similarity));
        
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const cardId = `card-${Math.random().toString(36).substr(2, 9)}`;
        
        let cardHTML = `
            <div class="result-media">
                ${result.video ? `
                    <video class="result-video" controls muted loop playsinline preload="metadata">
                        <source src="${result.video}" type="video/mp4">
                    </video>
                ` : result.image ? `
                    <img src="${result.image}" alt="Scene" class="result-thumbnail" loading="lazy">
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
                    <span class="spoiler-icon">▼</span> Tampilkan Informasi Anime
                </button>
                <div class="anime-info spoiler-content" id="${cardId}" style="display: none;">
                    <h3 style="margin: 0 0 15px 0; color: var(--primary-color); font-size: 1.1em;">Informasi Anime</h3>
                    
                    <div class="anime-info-container">
                        ${coverImage ? `
                            <div class="anime-cover">
                                <img src="${coverImage}" alt="Cover Anime" class="cover-image" loading="lazy">
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
                    
                    ${animeData.description ? `
                        <div class="synopsis-section">
                            <strong style="color: var(--primary-color);">📖 Sinopsis:</strong>
                            <p class="synopsis-text">${animeData.description.replace(/\n/g, ' ').substring(0, 400)}${animeData.description.length > 400 ? '...' : ''}</p>
                        </div>
                    ` : ''}
                    
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
                    
                    <div class="indo-anime-links">
                        <strong style="color: var(--primary-color);">🇮🇩 Nonton & Download Anime Sub Indo:</strong>
                        <div class="indo-links-grid">
                            ${animeSitesIndo.map(site => `
                                <a href="${generateAnimeUrl(site.url, animeData.title)}" target="_blank" class="indo-link-card" style="background:${site.bg}">
                                    <span class="link-icon">${site.icon}</span>
                                    <span class="link-text">${site.name}</span>
                                </a>
                            `).join('')}
                        </div>
                        <p class="indo-links-note">Klik situs di atas untuk mencari anime ini langsung</p>
                    </div>
                </div>
            `;
        }
        
        cardHTML += `</div>`;
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
                description(asHtml: false)
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
    if (similarity >= 95) {
        return { text: 'Sangat Akurat', class: 'accuracy-perfect' };
    } else if (similarity >= 87) {
        return { text: 'Cocok', class: 'accuracy-high' };
    } else if (similarity >= 80) {
        return { text: 'Kurang Yakin', class: 'accuracy-medium' };
    } else {
        return { text: 'Tidak Cocok', class: 'accuracy-very-low' };
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

function getJakartaHour() {
    const utcHour = new Date().getUTCHours();
    return (utcHour + 7) % 24;
}

function updateBackground() {
    const hour = getJakartaHour();

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

    const progressBar = animateProgressBar();
    
    btnSearch.disabled = true;
    searchText.style.display = 'none';
    loadingText.style.display = 'inline';
    resultsSection.style.display = 'none';

    try {
        await searchTraceMoe();
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


function toggleSpoiler(id) {
    const content = document.getElementById(id);
    const btn = content.previousElementSibling;
    const icon = btn.querySelector('.spoiler-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
        btn.childNodes[1].textContent = ' Sembunyikan Informasi Anime';
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
        btn.childNodes[1].textContent = ' Tampilkan Informasi Anime';
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

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName, btn);
    });
});

urlLoadBtn.addEventListener('click', loadImageFromUrl);

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadImageFromUrl();
    }
});

const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const devModal = document.getElementById('devModal');
const serverModal = document.getElementById('serverModal');
const devModalClose = document.getElementById('devModalClose');
const serverModalClose = document.getElementById('serverModalClose');
const openDeveloper = document.getElementById('openDeveloper');
const openServerInfo = document.getElementById('openServerInfo');

menuBtn.addEventListener('click', () => {
    menuDropdown.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.classList.remove('show');
    }
});

let phraseInterval = null;
let currentPhraseIndex = 0;

function rotatePhrase() {
    const phraseElement = document.getElementById('typingText');
    if (!phraseElement || !window.codingPhrases) return;
    
    phraseElement.textContent = codingPhrases[currentPhraseIndex];
    currentPhraseIndex = (currentPhraseIndex + 1) % codingPhrases.length;
}

openDeveloper.addEventListener('click', () => {
    menuDropdown.classList.remove('show');
    devModal.classList.add('show');
    
    if (!phraseInterval) {
        rotatePhrase();
        phraseInterval = setInterval(rotatePhrase, 60000);
    }
});

openServerInfo.addEventListener('click', () => {
    menuDropdown.classList.remove('show');
    serverModal.classList.add('show');
    updateServerInfo();
});

devModalClose.addEventListener('click', () => {
    devModal.classList.remove('show');
});

serverModalClose.addEventListener('click', () => {
    serverModal.classList.remove('show');
});

devModal.addEventListener('click', (e) => {
    if (e.target === devModal) {
        devModal.classList.remove('show');
    }
});

serverModal.addEventListener('click', (e) => {
    if (e.target === serverModal) {
        serverModal.classList.remove('show');
    }
});

async function updateServerInfo() {
    try {
        const res = await fetch('/api/server-info');
        const info = await res.json();
        const { ram, cpu, heap, uptime, totalRequests, nodeVersion, platform, arch, pid } = info;

        document.getElementById('ramUsage').textContent = `${ram.percent}% (${ram.usedMB} MB / ${ram.totalMB} MB)`;
        document.getElementById('ramBar').style.width = ram.percent + '%';
        document.getElementById('ramTotal').textContent = `Free: ${ram.freeMB} MB`;

        document.getElementById('cpuUsage').textContent = `${cpu.percent}% (Load: ${cpu.load1})`;
        document.getElementById('cpuBar').style.width = Math.min(cpu.percent, 100) + '%';
        document.getElementById('cpuLoad5').textContent = `Load 5m: ${cpu.load5}`;

        document.getElementById('heapUsage').textContent = `${heap.percent}% (${heap.usedMB} MB / ${heap.totalMB} MB)`;
        document.getElementById('heapBar').style.width = heap.percent + '%';
        document.getElementById('heapRss').textContent = `RSS: ${heap.rssMB} MB`;

        document.getElementById('cpuCores').textContent = `${cpu.count} Core`;
        document.getElementById('cpuArch').textContent = `Arch: ${arch}`;
        document.getElementById('cpuModel').textContent = cpu.model;

        const h = String(uptime.hours).padStart(2, '0');
        const m = String(uptime.minutes).padStart(2, '0');
        const s = String(uptime.seconds).padStart(2, '0');
        document.getElementById('uptime').textContent = `${h}j ${m}m ${s}d`;

        document.getElementById('totalRequests').textContent = totalRequests.toLocaleString();

        document.getElementById('svrPlatform').textContent = platform;
        document.getElementById('svrArch').textContent = arch;
        document.getElementById('svrNode').textContent = nodeVersion;
        document.getElementById('svrPid').textContent = pid;
    } catch (e) {
        ['ramUsage','cpuUsage','heapUsage','cpuCores','uptime','totalRequests'].forEach(id => {
            document.getElementById(id).textContent = 'Tidak tersedia';
        });
    }
}

(function initStats() {
    const onlineEl = document.getElementById('onlineCount');
    const totalEl = document.getElementById('totalVisits');

    function formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'jt';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'rb';
        return n.toString();
    }

    function connect() {
        const es = new EventSource('/api/stats');
        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                onlineEl.textContent = formatNumber(data.online);
                totalEl.textContent = formatNumber(data.total);
            } catch (_) {}
        };
        es.onerror = () => {
            es.close();
            setTimeout(connect, 5000);
        };
    }

    connect();
})();
