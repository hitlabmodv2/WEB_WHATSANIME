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
}

async function displayResults(results) {
    resultsContainer.innerHTML = '';
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Tidak ada hasil ditemukan.</p>';
        resultsSection.style.display = 'block';
        return;
    }

    const topResults = results.slice(0, 5);
    
    for (const result of topResults) {
        const similarity = (result.similarity * 100).toFixed(2);
        const episode = result.episode || '?';
        const timestampFrom = formatTime(result.from);
        const timestampTo = formatTime(result.to);
        
        let animeTitle = result.filename || 'Unknown';
        
        if (result.anilist) {
            try {
                const anilistData = await fetchAnilistTitle(result.anilist);
                if (anilistData) {
                    animeTitle = anilistData;
                }
            } catch (e) {
                animeTitle = result.filename.split('/').pop().split('[')[0].trim() || result.filename;
            }
        }
        
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-header">
                <div>
                    <div class="anime-title">${animeTitle}</div>
                </div>
                <span class="similarity-badge">${similarity}%</span>
            </div>
            <div class="result-info">
                <strong>Episode:</strong> ${episode}
            </div>
            <div class="result-info">
                <strong>Waktu:</strong> ${timestampFrom} - ${timestampTo}
            </div>
            ${result.image ? `<img src="${result.image}" alt="Scene" class="result-thumbnail">` : ''}
        `;
        
        resultsContainer.appendChild(card);
    }

    resultsSection.style.display = 'block';
}

async function fetchAnilistTitle(anilistId) {
    try {
        const query = `
        query ($id: Int) {
            Media (id: $id, type: ANIME) {
                title {
                    romaji
                    english
                    native
                }
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
        const title = data.data?.Media?.title;
        
        return title?.english || title?.romaji || title?.native || null;
    } catch (error) {
        return null;
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

    try {
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
        displayResults(data.result);
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mencari anime. Silakan coba lagi.');
    } finally {
        btnSearch.disabled = false;
        searchText.style.display = 'inline';
        loadingText.style.display = 'none';
    }
});

updateDateTime();
setInterval(updateDateTime, 1000);
