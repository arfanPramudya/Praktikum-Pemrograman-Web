// --- Bagian Konfigurasi ---
const API_KEY = import.meta.env.VITE_API_KEY || 'placeholder_key_from_env';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.weatherapi.com/v1';

// Pesan Troubleshooting
const ERROR_MESSAGES = {
    1002: '❌ API Key tidak diberikan. Silakan masukkan API Key Anda di script.js baris 3',
    1003: '❌ Parameter tidak lengkap. Pastikan sudah memasukkan nama kota',
    1005: '❌ URL API tidak valid. Hubungi developer',
    1006: '❌ Kota tidak ditemukan. Coba nama kota lain atau cek penulisan',
    2006: '❌ API Key tidak valid. Periksa kembali API Key Anda di https://www.weatherapi.com/my/',
    2007: '❌ Quota API sudah habis untuk bulan ini. Upgrade plan di https://www.weatherapi.com/pricing.aspx',
    2008: '❌ API Key telah dinonaktifkan. Hubungi support WeatherAPI',
    2009: '❌ API Key tidak memiliki akses ke fitur ini. Upgrade plan untuk akses lebih lengkap',
    9000: '❌ Format JSON bulk request tidak valid',
    9001: '❌ Terlalu banyak lokasi dalam bulk request (max 50)',
    9999: '❌ Error internal aplikasi WeatherAPI. Coba lagi nanti',
    'network': '❌ Gagal terhubung ke API. Periksa koneksi internet Anda',
    'parse': '❌ Response dari API tidak valid. Hubungi developer',
    'timeout': '❌ Permintaan API timeout. Coba lagi nanti'
};

// --- STATE MANAGEMENT ---
let currentCity = 'Bandar Lampung';
let unit = localStorage.getItem('unit') || 'metric'; // 'metric' (C) or 'imperial' (F)
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let autoRefreshInterval;
let searchDebounceTimer;
let currentSuggestionIndex = -1;

// --- DOM ELEMENTS ---
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const suggestionsList = document.getElementById('suggestions');
const unitToggle = document.getElementById('unit-toggle');
const themeToggle = document.getElementById('theme-toggle');
const refreshBtn = document.getElementById('refresh-btn');
const favBtn = document.getElementById('save-favorite');
const favIcon = document.getElementById('fav-icon');
const favoriteList = document.getElementById('favorite-list');

// --- DEBUG UTILITIES ---
function logDebug(message) {
    if (typeof console !== 'undefined' && console.log) {
        console.log(`[⏰ ${new Date().toLocaleTimeString('id-ID')}] [DEBUG] ${message}`);
    }
}

function logError(title, error) {
    if (typeof console !== 'undefined') {
        console.error(`[⏰ ${new Date().toLocaleTimeString('id-ID')}] [ERROR] ${title}`, error);
        if (error.code) console.error('Error Code:', error.code);
        if (error.message) console.error('Error Message:', error.message);
        if (error.status) console.error('HTTP Status:', error.status);
    }
}

// --- SECURITY UTILITIES ---
/**
 * Escape HTML special characters
 * @param {string} text - Text yang di-escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitasi input 
 * @param {string} city - City name input
 * @returns {string} Sanitized city name
 */
function sanitizeCityInput(city) {
    if (typeof city !== 'string') return '';
    
    // Remove leading/trailing whitespace
    let sanitized = city.trim();
    
    // Limit length to 100 characters
    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 100);
    }
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-,()]/gi, '');
    
    sanitized = sanitized.replace(/\s{2,}/g, ' ').trim();
    
    return sanitized;
}

/**
 * Validate city input sebelum  API request
 * @param {string} city - City name
 * @returns {object} {valid: boolean, error: string|null}
 */
function validateCityInput(city) {
    if (!city || typeof city !== 'string') {
        return { valid: false, error: '❌ Masukkan nama kota yang valid' };
    }
    
    const trimmed = city.trim();
    
    if (trimmed.length === 0) {
        return { valid: false, error: '❌ Nama kota tidak boleh kosong' };
    }
    
    if (trimmed.length < 2) {
        return { valid: false, error: '❌ Nama kota minimal 2 karakter' };
    }
    
    if (trimmed.length > 100) {
        return { valid: false, error: '❌ Nama kota tidak boleh lebih dari 100 karakter' };
    }
    
    // Check for suspicious patterns
    if (/^['"]|['"]$/.test(trimmed)) {
        return { valid: false, error: '❌ Input tidak valid - hapus tanda kutip' };
    }
    
    return { valid: true, error: null };
}

/**
 * Validate API response data structure
 * @param {object} data - Response dari API
 * @returns {boolean} Valid or not
 */
function validateApiResponse(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    // Check if response is error response
    if (data.error) {
        return false;
    }
    
    return true;
}

// --- Inisialisasi ---
document.addEventListener('DOMContentLoaded', () => {
    logDebug('=== Aplikasi Weather Dashboard Dimulai ===');
    logDebug(`API Base URL: ${BASE_URL}`);
    logDebug(`API Key Status: ${API_KEY === 'YOUR_API_KEY_HERE' ? '⚠️ BELUM DIKONFIGURASI' : '✅ Configured'}`);
    logDebug('🔒 Security: Input validation & XSS protection aktif');
    
    loadTheme();
    updateUnitLabel();
    renderFavorites();
    fetchWeather(currentCity);
    startAutoRefresh();
});

// --- THEME & UNIT HANDLING ---
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

function loadTheme() {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

unitToggle.addEventListener('click', () => {
    unit = unit === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('unit', unit);
    updateUnitLabel();
    fetchWeather(currentCity); // Refetch data with new unit
});

function updateUnitLabel() {
    unitToggle.textContent = unit === 'metric' ? '°C' : '°F';
}

// --- FITUR SEARCH ---
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    
    // Validate input
    const validation = validateCityInput(city);
    if (!validation.valid) {
        showError(true, validation.error);
        logError('Input Validation Failed:', validation.error);
        return;
    }
    
    const sanitized = sanitizeCityInput(city);
    suggestionsList.classList.add('hidden'); // Hide suggestions saat search
    fetchWeather(sanitized);
});

// Autocomplete dengan metode debounce
cityInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    const query = cityInput.value.trim();
    currentSuggestionIndex = -1; // Reset index
    
    // Validasi input
    if (!query || query.length < 1) {
        suggestionsList.classList.add('hidden');
        return;
    }
    
    const validation = validateCityInput(query);
    if (!validation.valid) {
        suggestionsList.classList.add('hidden');
        return;
    }
    
    // Debounce API call (tunggu 300ms setelah user berhenti typing)
    searchDebounceTimer = setTimeout(() => {
        searchCityLocations(query);
    }, 300);
});

// Keyboard navigation untuk suggestions
cityInput.addEventListener('keydown', (e) => {
    const items = Array.from(suggestionsList.querySelectorAll('li'));
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, items.length - 1);
        updateSuggestionSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
        updateSuggestionSelection(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentSuggestionIndex >= 0 && items[currentSuggestionIndex]) {
            items[currentSuggestionIndex].click();
        } else {
            // Jika tidak ada selection, search dengan input current
            const city = cityInput.value.trim();
            const validation = validateCityInput(city);
            if (validation.valid) {
                const sanitized = sanitizeCityInput(city);
                suggestionsList.classList.add('hidden');
                fetchWeather(sanitized);
            }
        }
    } else if (e.key === 'Escape') {
        suggestionsList.classList.add('hidden');
    }
});

/**
 * Search city locations menggunakan WeatherAPI Search API
 * @param {string} query - Search query
 */
async function searchCityLocations(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const searchUrl = `${BASE_URL}/search.json?key=${API_KEY}&q=${encodedQuery}&lang=id`;
        
        logDebug(`🔍 Searching for: ${query}`);
        
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
            logError('Search API Error:', response.status);
            suggestionsList.classList.add('hidden');
            return;
        }
        
        const data = await response.json();
        
        // Validate response
        if (!Array.isArray(data) || data.length === 0) {
            renderNoSuggestions();
            return;
        }
        
        // Render suggestions
        renderSuggestions(data);
        
    } catch (error) {
        logError('Search Locations Error:', error);
        suggestionsList.classList.add('hidden');
    }
}

/**
 * Render suggestions list
 * @param {array} locations - Array of location objects
 */
function renderSuggestions(locations) {
    suggestionsList.innerHTML = '';
    
    if (!Array.isArray(locations) || locations.length === 0) {
        renderNoSuggestions();
        return;
    }
    
    // Batasi hingga 8 saran lokasi
    const limitedLocations = locations.slice(0, 8);
    
    limitedLocations.forEach((location, index) => {
        try {
            // Sanitize location data
            const name = escapeHtml(location.name || '');
            const region = location.region ? escapeHtml(location.region) : '';
            const country = escapeHtml(location.country || '');
            
            const li = document.createElement('li');
            li.className = 'suggestion-item px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition border-b dark:border-slate-600 last:border-b-0';
            li.setAttribute('data-index', index);
            
            // Create display text
            let displayText = name;
            if (region) {
                displayText += `, ${region}`;
            }
            if (country) {
                displayText += `, ${country}`;
            }
            
            // Create main span
            const mainSpan = document.createElement('span');
            mainSpan.className = 'block font-medium text-slate-800 dark:text-slate-200';
            mainSpan.textContent = displayText;
            
            // Create secondary info
            const infoSpan = document.createElement('span');
            infoSpan.className = 'text-xs text-slate-500 dark:text-slate-400 block mt-1';
            infoSpan.textContent = `📍 Lat: ${location.lat.toFixed(2)}, Lon: ${location.lon.toFixed(2)}`;
            
            li.appendChild(mainSpan);
            li.appendChild(infoSpan);
            
            // Add click event
            li.addEventListener('click', () => {
                cityInput.value = name;
                suggestionsList.classList.add('hidden');
                fetchWeather(name);
            });
            
            suggestionsList.appendChild(li);
        } catch (e) {
            logError('Error rendering suggestion at index', index, e);
        }
    });
    
    suggestionsList.classList.remove('hidden');
}

/**
 * Render "no suggestions found" message
 */
function renderNoSuggestions() {
    suggestionsList.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'px-4 py-3 text-center text-gray-500 dark:text-gray-400';
    li.textContent = '❌ Lokasi tidak ditemukan. Coba nama lain.';
    suggestionsList.appendChild(li);
    suggestionsList.classList.remove('hidden');
}

/**
 * Update visual selection saat keyboard navigation
 * @param {array} items - List of suggestion items
 */
function updateSuggestionSelection(items) {
    // Remove previous selection
    items.forEach((item, idx) => {
        if (idx === currentSuggestionIndex) {
            item.classList.add('bg-blue-100', 'dark:bg-slate-600');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('bg-blue-100', 'dark:bg-slate-600');
        }
    });
}

// --- API FETCHING (AJAX) ---
async function fetchWeather(city) {
    showLoading(true);
    showError(false);
    logDebug(`Mencari cuaca untuk: ${city}`);
    
    try {
        // Validasi input sekali lagi sebelum fetch
        const validation = validateCityInput(city);
        if (!validation.valid) {
            throw { code: 1003, message: validation.error };
        }

        // Validasi API Key
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            throw {
                code: 1002,
                message: 'API Key belum dikonfigurasi.'
            };
        }

        // Encode city name untuk URL safety
        const encodedCity = encodeURIComponent(city);
        
        // 1. Get Current Weather menggunakan WeatherAPI.com
        const currentUrl = `${BASE_URL}/current.json?key=${API_KEY}&q=${encodedCity}&aqi=yes&lang=id`;
        logDebug(`Request URL (sanitized): ${currentUrl}`);
        
        const currentRes = await fetch(currentUrl);
        
        // Handle Network Errors
        if (!currentRes.ok) {
            const errorData = await currentRes.json().catch(() => null);
            const errorCode = errorData?.error?.code || currentRes.status;
            const message = ERROR_MESSAGES[errorCode] || `HTTP Error ${currentRes.status}`;
            
            throw {
                code: errorCode,
                message: message,
                status: currentRes.status
            };
        }

        const currentData = await currentRes.json().catch(() => {
            throw {
                code: 'parse',
                message: ERROR_MESSAGES['parse']
            };
        });

        // Validate API response structure
        if (!validateApiResponse(currentData)) {
            throw {
                code: 'parse',
                message: '❌ Response dari API tidak valid atau error'
            };
        }

        // 2. Get Forecast (5 hari ke depan)
        const forecastUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodedCity}&days=5&aqi=yes&alerts=yes&lang=id`;
        const forecastRes = await fetch(forecastUrl);
        
        if (!forecastRes.ok) {
            throw {
                code: forecastRes.status,
                message: 'Gagal mengambil data forecast'
            };
        }

        const forecastData = await forecastRes.json().catch(() => {
            throw {
                code: 'parse',
                message: ERROR_MESSAGES['parse']
            };
        });

        // Validate forecast response
        if (!validateApiResponse(forecastData)) {
            throw {
                code: 'parse',
                message: '❌ Response forecast dari API tidak valid'
            };
        }

        // 3. Update UI dengan data yang sudah divalidasi
        currentCity = currentData.location.name; // API returns safe data
        updateCurrentUI(currentData);
        updateForecastUI(forecastData.forecast.forecastday);
        checkFavoriteStatus();
        logDebug(`✅ Data cuaca berhasil dimuat untuk: ${escapeHtml(currentCity)}`);
        
    } catch (error) {
        let errorMessage = error.message;
        
        // Handle berbagai jenis error
        if (error instanceof TypeError) {
            errorMessage = ERROR_MESSAGES['network'];
            logError('Network Error:', error);
        } else if (error.code && ERROR_MESSAGES[error.code]) {
            errorMessage = ERROR_MESSAGES[error.code];
        }
        
        logError('Weather Fetch Error:', error);
        showError(true, errorMessage);
        
    } finally {
        showLoading(false);
    }
}

// --- UI UPDATES ---
function updateCurrentUI(data) {
    document.getElementById('current-weather').classList.remove('hidden');
    document.getElementById('forecast-section').classList.remove('hidden');
    document.getElementById('current-weather').classList.add('fade-in');

    const location = data.location;
    const current = data.current;

    // Escape location data untuk XSS protection
    const cityName = escapeHtml(location.name);
    const countryName = escapeHtml(location.country);
    
    document.getElementById('current-city').textContent = `${cityName}, ${countryName}`;
    document.getElementById('current-date').textContent = current.last_updated || new Date().toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    // Sesuaikan temperature unit
    const temp = unit === 'metric' ? Math.round(current.temp_c) : Math.round(current.temp_f);
    document.getElementById('current-temp').textContent = temp;
    document.getElementById('temp-unit').textContent = unit === 'metric' ? '°C' : '°F';
    
    // Escape weather description
    const weatherDesc = escapeHtml(current.condition.text);
    document.getElementById('weather-desc').textContent = weatherDesc;
    
    // Validate icon URL sebelum digunakan
    const iconUrl = current.condition.icon;
    if (iconUrl && typeof iconUrl === 'string' && iconUrl.startsWith('//')) {
        document.getElementById('weather-icon').src = `https:${iconUrl}`;
    } else {
        logError('Invalid icon URL:', iconUrl);
        document.getElementById('weather-icon').src = ''; // Fallback
    }
    
    document.getElementById('current-humidity').textContent = `${current.humidity}%`;
    const windSpeed = unit === 'metric' ? Math.round(current.wind_kph * 0.277778) : Math.round(current.wind_mph);
    document.getElementById('current-wind').textContent = `${windSpeed} ${unit === 'metric' ? 'm/s' : 'mph'}`;
    document.getElementById('current-visibility').textContent = `${unit === 'metric' ? current.vis_km : current.vis_miles} ${unit === 'metric' ? 'km' : 'mi'}`;
    
    // Tampilkan Air Quality jika tersedia
    if (current.air_quality && typeof current.air_quality === 'object') {
        const aqi = current.air_quality['us-epa-index'];
        const aqiText = ['', 'Baik', 'Sedang', 'Tidak Sehat (Sensitif)', 'Tidak Sehat', 'Sangat Tidak Sehat', 'Berbahaya'][aqi];
        logDebug(`Air Quality: ${aqiText} (EPA Index: ${aqi})`);
    }
}

function updateForecastUI(forecastDays) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = ''; // Clear old data

    // Validate forecastDays is array
    if (!Array.isArray(forecastDays)) {
        logError('Invalid forecast data:', forecastDays);
        return;
    }

    // WeatherAPI.com memberikan prediksi 5 hari kedepan
    forecastDays.slice(0, 5).forEach((day, index) => {
        try {
            // Validate day object
            if (!day || !day.date || !day.day || !day.day.condition) {
                logError('Invalid day data at index:', index);
                return;
            }

            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            
            const card = document.createElement('div');
            card.className = `bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md text-center border border-gray-100 dark:border-slate-700 fade-in`;
            card.style.animationDelay = `${index * 100}ms`;
            
            const tempC = Math.round(day.day.avgtemp_c);
            const tempF = Math.round(day.day.avgtemp_f);
            const temp = unit === 'metric' ? tempC : tempF;
            
            // Escape condition text
            const conditionText = escapeHtml(day.day.condition.text);
            
            // Validate icon URL
            const iconUrl = day.day.condition.icon;
            let iconSrc = '';
            if (iconUrl && typeof iconUrl === 'string' && iconUrl.startsWith('//')) {
                iconSrc = `https:${iconUrl}`;
            }
            
            card.innerHTML = `
                <p class="font-bold text-slate-700 dark:text-slate-200">${escapeHtml(dayName)}</p>
                <p class="text-xs text-gray-500 mb-2">${escapeHtml(dateStr)}</p>
                <img src="${escapeHtml(iconSrc)}" class="w-12 h-12 mx-auto" alt="Weather icon" onerror="this.style.display='none'">
                <p class="text-sm font-medium capitalize text-slate-600 dark:text-slate-300 h-10 flex items-center justify-center">${conditionText}</p>
                <p class="font-bold text-lg mt-2 text-slate-800 dark:text-white">${temp}°</p>
                <p class="text-xs text-gray-500 mt-1">💧 ${day.day.avghumidity}%</p>
            `;
            container.appendChild(card);
        } catch (e) {
            logError('Error rendering forecast card at index', index, e);
        }
    });
    
    logDebug(`✅ Forecast untuk 5 hari berhasil ditampilkan`);
}

// --- Utilitas ---
function showLoading(show) {
    const loader = document.getElementById('loading');
    if (show) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
}

function showError(show, message = '') {
    const el = document.getElementById('error-msg');
    const text = document.getElementById('error-text');
    if (show) {
        el.classList.remove('hidden');
        text.innerHTML = `
            <strong>⚠️ Ada masalah:</strong><br/>
            ${message}<br/>
            <small class="text-xs mt-2 block text-gray-600">💡 Tip: Buka Console (F12) untuk info lebih detail</small>
        `;
        document.getElementById('current-weather').classList.add('hidden');
        document.getElementById('forecast-section').classList.add('hidden');
    } else {
        el.classList.add('hidden');
    }
}

// --- Lokasi Favorit User ---
favBtn.addEventListener('click', () => {
    const index = favorites.indexOf(currentCity);
    if (index === -1) {
        favorites.push(currentCity);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    checkFavoriteStatus();
    renderFavorites();
});

function checkFavoriteStatus() {
    if (favorites.includes(currentCity)) {
        favIcon.textContent = 'favorite'; // Filled heart
        favIcon.classList.remove('text-white');
        favIcon.classList.add('text-red-500');
    } else {
        favIcon.textContent = 'favorite_border'; // Outline heart
        favIcon.classList.add('text-white');
        favIcon.classList.remove('text-red-500');
    }
}

function renderFavorites() {
    favoriteList.innerHTML = '';
    if (favorites.length === 0) {
        favoriteList.innerHTML = '<li class="text-sm text-gray-500 italic text-center py-2">Belum ada favorit</li>';
        return;
    }

    favorites.forEach((city, index) => {
        // Validate and sanitize city name
        if (typeof city !== 'string' || city.trim().length === 0) {
            logError('Invalid city in favorites:', city);
            return;
        }

        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-gray-50 dark:bg-slate-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer transition';
        
        // Create span for city name - use textContent untuk XSS prevention
        const citySpan = document.createElement('span');
        citySpan.className = 'flex-grow font-medium text-slate-700 dark:text-slate-200';
        citySpan.textContent = city; // Using textContent instead of innerHTML
        citySpan.style.cursor = 'pointer';
        
        // Add click event listener (safer than inline onclick)
        citySpan.addEventListener('click', () => {
            fetchWeather(city);
        });
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'text-gray-400 hover:text-red-500 transition';
        removeBtn.setAttribute('data-city-index', index);
        removeBtn.setAttribute('title', `Hapus ${city} dari favorit`);
        
        // Create icon span
        const iconSpan = document.createElement('span');
        iconSpan.className = 'material-symbols-outlined text-sm';
        iconSpan.textContent = 'close';
        
        removeBtn.appendChild(iconSpan);
        
        // Add click event listener untuk remove
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering parent click
            removeFavoriteItem(city);
        });
        
        li.appendChild(citySpan);
        li.appendChild(removeBtn);
        favoriteList.appendChild(li);
    });
}

// New function untuk remove favorite dengan proper validation
function removeFavoriteItem(city) {
    if (typeof city !== 'string' || city.trim().length === 0) {
        logError('Invalid city to remove:', city);
        return;
    }

    favorites = favorites.filter(c => c !== city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
    
    if (currentCity === city) {
        checkFavoriteStatus();
    }
    
    logDebug(`✅ Dihapus dari favorit: ${escapeHtml(city)}`);
}

// --- AUTO UPDATE (Real-time every 5 mins) ---
function startAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(() => {
        console.log('Auto refreshing data...');
        fetchWeather(currentCity);
    }, 300000); // 300,000 ms = 5 menit
}

// Manual Refresh
refreshBtn.addEventListener('click', () => {
    fetchWeather(currentCity);
});

// Geo Location
document.getElementById('geo-btn').addEventListener('click', () => {
    logDebug('User meminta akses Geolocation');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                logDebug(`Geolocation berhasil: ${latitude}, ${longitude}`);
                fetchWeatherByCoords(latitude, longitude);
            },
            error => {
                logError('Geolocation Error:', error);
                let message = 'Tidak bisa mengakses lokasi Anda';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'Izin akses lokasi ditolak. Aktifkan di browser settings';
                }
                showError(true, message);
            }
        );
    } else {
        const message = '❌ Geolocation tidak didukung di browser ini. Gunakan pencarian manual.';
        logError('Geolocation Not Supported', message);
        showError(true, message);
    }
});

async function fetchWeatherByCoords(lat, lon) {
    // Validate latitude and longitude
    if (typeof lat !== 'number' || typeof lon !== 'number') {
        showError(true, '❌ Koordinat tidak valid');
        logError('Invalid coordinates:', { lat, lon });
        return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        showError(true, '❌ Koordinat di luar jangkauan');
        logError('Coordinates out of range:', { lat, lon });
        return;
    }

    // lat/lon langsung ke API WeatherAPI.com
    logDebug(`Menggunakan Geolocation: Lat ${lat}, Lon ${lon}`);
    
    try {
        const res = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=yes&lang=id`);
        if (!res.ok) throw new Error('Gagal mengambil data geolocation');
        
        const data = await res.json();
        
        // Validate response
        if (!validateApiResponse(data)) {
            throw new Error('Response data tidak valid');
        }

        const cityName = data.location.name;
        if (typeof cityName !== 'string' || cityName.trim().length === 0) {
            throw new Error('Nama kota tidak valid dari response');
        }

        fetchWeather(cityName);
     } catch(e) { 
        logError('Geolocation Fetch Error:', e);
        showError(true, ERROR_MESSAGES['network'] + ' (Geolocation)');
     }
}