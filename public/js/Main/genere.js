// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get Genre ID from URL
function getGenreId() {
    const params = new URLSearchParams(window.location.search);
    const genreId = params.get('genre_id');
    if (!genreId || isNaN(genreId)) {
        return null;
    }
    return genreId;
}

// Fetch Movies by Genre with Pagination
async function fetchMovies(genreId, keyword = '', page = 1, pageSize = 12) {
    if (!genreId) {
        document.getElementById('movieList').innerHTML = `<p class="text-gray-400 text-center">Vui lòng chọn một thể loại phim.</p>`;
        document.getElementById('sectionTitle').textContent = 'Lỗi: Thiếu thể loại';
        return;
    }

    try {
        let url = `http://localhost:3000/api/movies?genre_id=${genreId}&page=${page}&pageSize=${pageSize}`;
        if (keyword) url += `&search=${encodeURIComponent(keyword)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Lỗi API /api/movies: ${response.status} ${response.statusText}`);
        const data = await response.json();

        let movies = [];
        let total = 0;

        // Handle different API response structures
        if (Array.isArray(data)) {
            // Flat array: paginate client-side
            movies = data.slice((page - 1) * pageSize, page * pageSize);
            total = data.length;
        } else if (data.movies && Array.isArray(data.movies)) {
            movies = data.movies;
            total = data.total || movies.length;
        } else if (data.results && Array.isArray(data.results)) {
            movies = data.results;
            total = data.total || movies.length;
        } else if (data.error) {
            throw new Error(`Lỗi từ API: ${data.error}`);
        } else {
            throw new Error('Dữ liệu phim không phải mảng');
        }

        const genreResponse = await fetch(`http://localhost:3000/api/genres`);
        if (!genreResponse.ok) throw new Error('Lỗi lấy thể loại');
        const genres = await genreResponse.json();
        const genre = genres.find(g => g.id == genreId);
        const genreName = genre ? genre.name : 'Không xác định';

        renderMovies(movies, genreName);
        renderPagination(total, page, pageSize, genreId, keyword);
    } catch (error) {
        console.error('Error fetching movies:', error);
        document.getElementById('movieList').innerHTML = `<p class="text-gray-400 text-center">Lỗi khi tải danh sách phim: ${error.message}</p>`;
        document.getElementById('sectionTitle').textContent = 'Lỗi tải phim';
    }
}

// Search Movies within Genre
async function searchMovies() {
    const keyword = document.getElementById('searchInput').value.trim();
    const genreId = getGenreId();
    if (genreId) {
        fetchMovies(genreId, keyword, 1);
    }
}

// Render Movies
function renderMovies(movies, genreName) {
    const container = document.getElementById('movieList');
    const title = document.getElementById('sectionTitle');
    title.textContent = `Phim thuộc thể loại: ${genreName}`;
    if (!movies || movies.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-center">Không tìm thấy phim nào trong thể loại này.</p>`;
        return;
    }

    container.innerHTML = movies
        .map(
            movie => `
    <div class="movie-card bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-orange-500/20">
        <a href="movie-detail.html?id=${movie.id}">
            <img src="${
                movie.image_url || 'https://via.placeholder.com/300x180?text=' + encodeURIComponent(movie.title)
            }" class="w-full h-60 object-cover" style="cursor:pointer;">
        </a>
        <div class="p-3">
            <h3 class="font-semibold truncate">${movie.title}</h3>
            <div class="flex justify-between text-sm text-gray-400 mt-1">
                <span>${movie.year || 'N/A'}</span>
                <span class="bg-orange-500 text-white px-1 rounded">HD</span>
            </div>
            <p class="text-sm text-gray-400 mt-1"><i class="fas fa-eye"></i> ${
                movie.views || 0
            } lượt xem</p>
            <div class="flex gap-3 mt-2">
                <button onclick="window.location.href='watch.html?id=${movie.id}'"
                        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm flex items-center gap-1">
                    <i class="fas fa-play"></i> Xem ngay
                </button>
                <button onclick="showMovieDetails(${movie.id})"
                        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm flex items-center gap-1">
                    <i class="fas fa-info-circle"></i> Chi tiết
                </button>
            </div>
        </div>
    </div>
    `
        )
        .join('');
}

// Render Pagination
function renderPagination(totalMovies, currentPage, pageSize, genreId, keyword) {
    const totalPages = Math.ceil(totalMovies / pageSize);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Trước';
    prevButton.className = `pagination-button px-4 py-2 rounded bg-orange-500 text-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}`;
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => fetchMovies(genreId, keyword, currentPage - 1, pageSize);
    paginationContainer.appendChild(prevButton);

    // Page Numbers
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = `pagination-button px-4 py-2 rounded ${i === currentPage ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`;
        pageButton.onclick = () => fetchMovies(genreId, keyword, i, pageSize);
        paginationContainer.appendChild(pageButton);
    }

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Sau';
    nextButton.className = `pagination-button px-4 py-2 rounded bg-orange-500 text-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}`;
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => fetchMovies(genreId, keyword, currentPage + 1, pageSize);
    paginationContainer.appendChild(nextButton);
}

// Show Movie Details
function showMovieDetails(movieId) {
    window.location.href = `movie-detail.html?id=${movieId}`;
}

// Iframe Handling


// Navbar Authentication
function updateNavbar() {
    const authSection = document.getElementById('authSection');
    const navLinks = document.querySelector('.md\\:flex.space-x-8');
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
    }

    const existingAdminLink = document.getElementById('adminLink');
    if (existingAdminLink) existingAdminLink.remove();

    if (user && user.name && user.id) {
        authSection.innerHTML = `
            <span class="text-white">👋 Xin chào, <strong>${user.name}</strong></span>
            <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Đăng xuất</button>
        `;
        if (user.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.id = 'adminLink';
            adminLink.textContent = 'Quản lý tài khoản';
            adminLink.className = 'text-white hover:text-orange-500';
            navLinks.appendChild(adminLink);

            const admin_movieLink = document.createElement('a');
            admin_movieLink.href = 'admin-movie.html';
            admin_movieLink.id = 'admin-movieLink';
            admin_movieLink.textContent = 'Quản lý phim';
            admin_movieLink.className = 'text-white hover:text-orange-500';
            navLinks.appendChild(admin_movieLink);
        }
    } else {
        authSection.innerHTML = `
            <button onclick="openIframe('login.html')" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">Đăng nhập</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('user');
    alert('Đăng xuất thành công!');
    updateNavbar();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    const genreId = getGenreId();
    if (genreId) {
        fetchMovies(genreId, '', 1, 12);
    } else {
        document.getElementById('movieList').innerHTML = `<p class="text-gray-400 text-center">Vui lòng chọn một thể loại phim.</p>`;
        document.getElementById('sectionTitle').textContent = 'Lỗi: Thiếu thể loại';
    }
});

window.addEventListener('message', (event) => {
    if (event.data.type === 'login-success') {
        localStorage.setItem('user', JSON.stringify(event.data.user));
        closeIframe();
        updateNavbar();
    } else if (event.data === 'closeIframe') {
        closeIframe();
    }
});

function showDonateModal() {
    const modal = document.getElementById('donateModal');
    modal.style.display = 'flex';
}

// Close Donate Modal
function closeDonateModal() {
    const modal = document.getElementById('donateModal');
    
    modal.style.display = 'none';
}

// Close Modal on Background Click
document.addEventListener('click', (event) => {
    const modal = document.getElementById('donateModal');
    if (event.target === modal) {
        closeDonateModal();
    }
});
