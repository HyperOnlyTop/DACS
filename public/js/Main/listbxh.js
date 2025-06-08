let movies = [];
let currentPage = 1;
const pageSize = 12;

function updateNavbar() {
    const authSection = document.getElementById('authSection');
    const navLinks = document.querySelector('.md\\:flex.space-x-8');
    const user = JSON.parse(localStorage.getItem('user'));
    const existingAdminLink = document.getElementById('adminLink');
    if (existingAdminLink) existingAdminLink.remove();

    if (user && user.name) {
        authSection.innerHTML = `
            <span class="text-white">👋 Xin chào, <strong>${user.name}</strong></span>
            <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Đăng xuất</button>
        `;
        if (user.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = "/admin.html";
            adminLink.id = 'adminLink';
            adminLink.textContent = "Quản lý tài khoản";
            adminLink.className = "text-white hover:text-orange-500";
            navLinks.appendChild(adminLink);

            const adminMovieLink = document.createElement('a');
            adminMovieLink.href = "/admin-movie.html";
            adminMovieLink.id = 'adminMovieLink';
            adminMovieLink.textContent = "Quản lý phim";
            adminMovieLink.className = "text-white hover:text-orange-500";
            navLinks.appendChild(adminMovieLink);
        }
    } else {
        authSection.innerHTML = `
            <button onclick="window.location.href='/login.html'" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">Đăng nhập</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('user');
    alert("Đăng xuất thành công!");
    window.location.href = '/index.html';
}

async function fetchRanking() {
    try {
        const response = await fetch('/api/ranking');
        if (!response.ok) throw new Error('Không thể lấy bảng xếp hạng. Mã lỗi: ' + response.status);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Không có phim nào trong bảng xếp hạng.');
        movies = data.slice(0, 100);
        renderRanking();
        renderPagination();
    } catch (error) {
        console.error('Lỗi fetchRanking:', error);
        const rankList = document.getElementById('rank-list');
        rankList.innerHTML = `<p class="text-center text-red-500">Lỗi: ${error.message}</p>`;
        alert('Lỗi khi tải bảng xếp hạng: ' + error.message);
    }
}

async function fetchMovieRating(movieId) {
    try {
        const res = await fetch(`/api/ratings/${movieId}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data && data.average_rating ? parseFloat(data.average_rating) : 0;
    } catch {
        return 0;
    }
}

async function renderRanking() {
    const rankList = document.getElementById("rank-list");
    if (!rankList) {
        console.error('Không tìm thấy #rank-list');
        return;
    }
    rankList.innerHTML = '';

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedMovies = movies.slice(startIndex, startIndex + pageSize);

    for (let index = 0; index < paginatedMovies.length; index++) {
        const movie = paginatedMovies[index];
        const div = document.createElement("div");
        div.className = "movie-card bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition";
        // Lấy rating trung bình
        const avgRating = await fetchMovieRating(movie.id);
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (avgRating >= i) {
                stars += '<i class="fas fa-star text-yellow-400"></i>';
            } else if (avgRating >= i - 0.5) {
                stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
            } else {
                stars += '<i class="far fa-star text-yellow-400"></i>';
            }
        }
        div.innerHTML = `
            <div class="relative">
                <a href="/movie-detail.html?id=${movie.id}" class="block group">
                    <img src="${movie.image_url || '/images/default.jpg'}" 
                         alt="${movie.title}" 
                         class="w-full h-48 object-cover rounded-lg mb-3 transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                         onerror="this.src='/images/default.jpg'">
                </a>
                <span class="absolute top-2 left-2 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full">#${startIndex + index + 1}</span>
            </div>
            <h2 class="text-xl font-semibold mb-1">${movie.title}</h2>
            <div class="flex items-center gap-2 mb-1">${stars}<span class="text-sm text-gray-400 ml-2">${avgRating.toFixed(1)}/5</span></div>
            <p class="text-sm text-gray-400">📅 Năm: ${movie.year || 'N/A'}</p>
            <p class="text-sm text-gray-400">👁️ ${movie.views?.toLocaleString() || '0'} lượt xem</p>
            <div class="flex gap-2 mt-2">
                <button onclick="showMovieDetails(${movie.id})" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition">
                    <i class="fas fa-info-circle"></i> Chi tiết
                </button>
                <button onclick="watchMovie(${movie.id})" 
                        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition">
                    <i class="fas fa-play"></i> Xem ngay
                </button>
            </div>
        `;
        rankList.appendChild(div);
    }
}

function renderPagination() {
    const totalPages = Math.ceil(movies.length / pageSize);
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) {
        console.error('Không tìm thấy #pagination');
        return;
    }
    paginationDiv.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-1 rounded-md ${i === currentPage ? 'bg-orange-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`;
        btn.onclick = () => {
            currentPage = i;
            renderRanking();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        paginationDiv.appendChild(btn);
    }
}

function showMovieDetails(movieId) {
    window.location.href = `/movie-detail.html?id=${movieId}`;
}

function watchMovie(movieId) {
    window.location.href = `/watch.html?id=${movieId}`;
}

function showDonateModal() {
    const modal = document.getElementById('donateModal');
    if (modal) modal.style.display = 'flex';
}

function closeDonateModal() {
    const modal = document.getElementById('donateModal');
    if (modal) modal.style.display = 'none';
}

document.addEventListener('click', (event) => {
    const modal = document.getElementById('donateModal');
    if (modal && event.target === modal) {
        closeDonateModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    fetchRanking();
});