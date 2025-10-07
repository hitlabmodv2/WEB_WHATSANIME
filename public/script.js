let selectedFile = null;
let selectedImageUrl = null;

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
const tabUpload = document.getElementById('tabUpload');
const tabUrl = document.getElementById('tabUrl');
const uploadContent = document.getElementById('uploadContent');
const urlContent = document.getElementById('urlContent');
const urlInput = document.getElementById('urlInput');
const btnLoadUrl = document.getElementById('btnLoadUrl');
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
    selectedImageUrl = null;
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

function handleImageUrl(url) {
    selectedImageUrl = url;
    selectedFile = null;
    
    previewImage.src = url;
    previewImage.onerror = () => {
        alert('Gagal memuat gambar. Periksa URL dan coba lagi.');
        selectedImageUrl = null;
        btnSearch.disabled = true;
    };
    previewImage.onload = () => {
        uploadContent.style.display = 'none';
        urlContent.style.display = 'none';
        previewBox.style.display = 'block';
        btnSearch.disabled = false;
    };
}

function resetToUploadTab() {
    const videos = document.querySelectorAll('.result-video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
        video.src = '';
    });
    
    selectedFile = null;
    selectedImageUrl = null;
    previewBox.style.display = 'none';
    uploadContent.style.display = 'block';
    urlContent.style.display = 'none';
    tabUpload.classList.add('active');
    tabUrl.classList.remove('active');
    btnSearch.disabled = true;
    fileInput.value = '';
    urlInput.value = '';
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
        const key = `${result.anilist || result.filename}-${result.episode}-${Math.floor(result.from)}`;
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
            
            const studios = animeData.studios?.nodes?.map(s => s.name).join(', ') || '';
            const genres = animeData.genres?.join(', ') || '';
            
            const startDate = animeData.startDate ? 
                `${animeData.startDate.year}-${String(animeData.startDate.month).padStart(2, '0')}-${String(animeData.startDate.day).padStart(2, '0')}` : '';
            const endDate = animeData.endDate ? 
                `${animeData.endDate.year}-${String(animeData.endDate.month).padStart(2, '0')}-${String(animeData.endDate.day).padStart(2, '0')}` : '';
            
            cardHTML += `
                <button class="spoiler-btn" onclick="toggleSpoiler('${cardId}')">
                    <span class="spoiler-icon">▼</span> Detail Anime
                </button>
                <div class="anime-info spoiler-content" id="${cardId}" style="display: none;">
                    <div class="anime-titles">
                        ${titles.map(t => `<div class="anime-title">${t}</div>`).join('')}
                    </div>
                    ${animeData.episodes ? `<div class="info-line">📺 ${animeData.episodes} episode ${animeData.duration}-minute ${animeData.format || 'TV'} anime.</div>` : ''}
                    ${startDate ? `<div class="info-line">📅 Airing from ${startDate}${endDate ? ' to ' + endDate : ''}.</div>` : ''}
                    
                    ${allTitles.length > titles.length ? `
                        <div class="alias-section">
                            <strong>🏷️ Alias</strong>
                            ${allTitles.slice(titles.length).map(alias => `<div class="alias">${alias}</div>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${genres ? `<div class="info-line"><strong>🎭 Genre:</strong> ${genres}</div>` : ''}
                    ${studios ? `<div class="info-line"><strong>🎬 Studio:</strong> ${studios}</div>` : ''}
                    
                    ${animeData.externalLinks?.length ? `
                        <div class="external-links">
                            <strong>🔗 External Links:</strong>
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

tabUpload.addEventListener('click', () => {
    if (previewBox.style.display === 'block') {
        return;
    }
    tabUpload.classList.add('active');
    tabUrl.classList.remove('active');
    uploadContent.style.display = 'block';
    urlContent.style.display = 'none';
});

tabUrl.addEventListener('click', () => {
    if (previewBox.style.display === 'block') {
        return;
    }
    tabUrl.classList.add('active');
    tabUpload.classList.remove('active');
    urlContent.style.display = 'block';
    uploadContent.style.display = 'none';
});

btnLoadUrl.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) {
        alert('Masukkan URL gambar terlebih dahulu');
        return;
    }
    handleImageUrl(url);
});

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btnLoadUrl.click();
    }
});

btnRemove.addEventListener('click', () => {
    resetToUploadTab();
});

btnSearch.addEventListener('click', async () => {
    if (!selectedFile && !selectedImageUrl) return;

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
    let response;
    
    if (selectedImageUrl) {
        response = await fetch(`https://api.trace.moe/search?url=${encodeURIComponent(selectedImageUrl)}`);
    } else {
        const formData = new FormData();
        formData.append('image', selectedFile);
        response = await fetch('https://api.trace.moe/search', {
            method: 'POST',
            body: formData
        });
    }

    const data = await response.json();
    displayTraceMoeResults(data.result);
}

async function searchSauceNAO() {
    let imageUrl = selectedImageUrl;
    
    if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch('https://saucenao.com/search.php?output_type=2&numres=5', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        displaySauceNAOResults(data.results);
    } else if (imageUrl) {
        const response = await fetch(`https://saucenao.com/search.php?output_type=2&numres=5&url=${encodeURIComponent(imageUrl)}`);
        const data = await response.json();
        displaySauceNAOResults(data.results);
    }
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
