// --- Bagian Konfigurasi ---
const API_KEY = 'ec843ff1ff304a60853102316252911'; // GANTI DENGAN API KEY ANDA
const BASE_URL = 'https://api.weatherapi.com/v1';

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

// --- Inisialisasi ---
document.addEventListener('DOMContentLoaded', () => {
    logDebug('=== Aplikasi Weather Dashboard Dimulai ===');
    logDebug(`API Base URL: ${BASE_URL}`);
    logDebug(`API Key Status: ${API_KEY === 'YOUR_API_KEY_HERE' ? '⚠️ BELUM DIKONFIGURASI' : '✅ Configured'}`);
    
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

// --- SEARCH FUNCTIONALITY ---
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

cityInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
        suggestionsList.classList.add('hidden');
    } else {
        // Simple autocomplete simulation (debounce would be better for production)
        if (cityInput.value.length > 2) {
             // Di aplikasi nyata, panggil API geo/direct di sini
             // Untuk tugas ini, kita hanya menampilkan UI logic atau ambil dari favorites
        }
    }
});

// --- API FETCHING (AJAX) ---
async function fetchWeather(city) {
    showLoading(true);
    showError(false);
    logDebug(`Mencari cuaca untuk: ${city}`);
    
    try {
        // Validasi API Key
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            throw {
                code: 1002,
                message: 'API Key belum dikonfigurasi.'
            };
        }

        // 1. Get Current Weather menggunakan WeatherAPI.com
        const currentUrl = `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=yes&lang=id`;
        logDebug(`Request URL: ${currentUrl}`);
        
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

        // 2. Get Forecast (5 hari ke depan)
        const forecastUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=5&aqi=yes&alerts=yes&lang=id`;
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

        // 3. Update UI
        currentCity = currentData.location.name;
        updateCurrentUI(currentData);
        updateForecastUI(forecastData.forecast.forecastday);
        checkFavoriteStatus();
        logDebug(`✅ Data cuaca berhasil dimuat untuk: ${currentCity}`);
        
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

    document.getElementById('current-city').textContent = `${location.name}, ${location.country}`;
    document.getElementById('current-date').textContent = current.last_updated || new Date().toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    // Sesuaikan temperature unit
    const temp = unit === 'metric' ? Math.round(current.temp_c) : Math.round(current.temp_f);
    document.getElementById('current-temp').textContent = temp;
    document.getElementById('temp-unit').textContent = unit === 'metric' ? '°C' : '°F';
    
    document.getElementById('weather-desc').textContent = current.condition.text;
    document.getElementById('weather-icon').src = `https:${current.condition.icon}`; // WeatherAPI icon format
    
    document.getElementById('current-humidity').textContent = `${current.humidity}%`;
    const windSpeed = unit === 'metric' ? Math.round(current.wind_kph * 0.277778) : Math.round(current.wind_mph);
    document.getElementById('current-wind').textContent = `${windSpeed} ${unit === 'metric' ? 'm/s' : 'mph'}`;
    document.getElementById('current-visibility').textContent = `${unit === 'metric' ? current.vis_km : current.vis_miles} ${unit === 'metric' ? 'km' : 'mi'}`;
    
    // Tampilkan Air Quality
    if (current.air_quality) {
        const aqi = current.air_quality['us-epa-index'];
        const aqiText = ['', 'Baik', 'Sedang', 'Tidak Sehat (Sensitif)', 'Tidak Sehat', 'Sangat Tidak Sehat', 'Berbahaya'][aqi];
        logDebug(`Air Quality: ${aqiText} (EPA Index: ${aqi})`);
    }
}

function updateForecastUI(forecastDays) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = ''; // Clear old data

    // WeatherAPI.com memberikan prediksi 5 hari kedepan
    forecastDays.slice(0, 5).forEach((day, index) => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        
        const card = document.createElement('div');
        card.className = `bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md text-center border border-gray-100 dark:border-slate-700 fade-in`;
        card.style.animationDelay = `${index * 100}ms`;
        
        const tempC = Math.round(day.day.avgtemp_c);
        const tempF = Math.round(day.day.avgtemp_f);
        const temp = unit === 'metric' ? tempC : tempF;
        
        card.innerHTML = `
            <p class="font-bold text-slate-700 dark:text-slate-200">${dayName}</p>
            <p class="text-xs text-gray-500 mb-2">${dateStr}</p>
            <img src="https:${day.day.condition.icon}" class="w-12 h-12 mx-auto" alt="Weather icon">
            <p class="text-sm font-medium capitalize text-slate-600 dark:text-slate-300 h-10 flex items-center justify-center">${day.day.condition.text}</p>
            <p class="font-bold text-lg mt-2 text-slate-800 dark:text-white">${temp}°</p>
            <p class="text-xs text-gray-500 mt-1">💧 ${day.day.avghumidity}%</p>
        `;
        container.appendChild(card);
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

    favorites.forEach(city => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-gray-50 dark:bg-slate-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer transition';
        li.innerHTML = `
            <span onclick="fetchWeather('${city}')" class="flex-grow font-medium text-slate-700 dark:text-slate-200">${city}</span>
            <button onclick="removeFavorite('${city}')" class="text-gray-400 hover:text-red-500">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        `;
        favoriteList.appendChild(li);
    });
}

window.removeFavorite = (city) => {
    favorites = favorites.filter(c => c !== city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
    if (currentCity === city) checkFavoriteStatus();
};

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
    // lat/lon langsung ke API WeatherAPI.com
    logDebug(`Menggunakan Geolocation: Lat ${lat}, Lon ${lon}`);
     try {
        const res = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=yes&lang=id`);
        if (!res.ok) throw new Error('Gagal mengambil data geolocation');
        const data = await res.json();
        fetchWeather(data.location.name); // Redirect to main fetch by name untuk konsistensi
     } catch(e) { 
        logError('Geolocation Fetch Error:', e);
        showError(true, ERROR_MESSAGES['network'] + ' (Geolocation)');
     }
}