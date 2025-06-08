let currentMovieId = null;
let currentPage = 1; // Track current page

// Show Notification
function showNotification(message, type = 'error') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    messageElement.textContent = message;
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md text-white shadow-lg ${
        type === 'error' ? 'bg-red-600' : 'bg-green-600'
    }`;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Check Admin Role
function checkAdminRole() {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
    }
    if (!user || user.role !== 'admin') {
        showNotification('Bạn không có quyền truy cập trang này', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        return false;
    }
    return user;
}

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

    // Xóa các liên kết admin cũ nếu có
    const existingAdminLinks = document.querySelectorAll('#adminAccountLink, #adminMovieLink');
    existingAdminLinks.forEach(link => link.remove());

    if (user && user.name && user.id) {
        authSection.innerHTML = `
            <span class="text-white">👋 Xin chào, <strong>${user.name}</strong></span>
            <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Đăng xuất</button>
        `;
        if (user.role === 'admin') {
            // Thêm liên kết Quản lý tài khoản
            const adminAccountLink = document.createElement('a');
            adminAccountLink.href = 'admin.html';
            adminAccountLink.id = 'adminAccountLink';
            adminAccountLink.textContent = 'Quản lý tài khoản';
            adminAccountLink.className = 'text-white hover:text-orange-500';
            navLinks.appendChild(adminAccountLink);

            // Thêm liên kết Quản lý phim
            const adminMovieLink = document.createElement('a');
            adminMovieLink.href = 'admin-movie.html';
            adminMovieLink.id = 'adminMovieLink';
            adminMovieLink.textContent = 'Quản lý phim';
            adminMovieLink.className = 'text-orange-500'; // Đánh dấu active
            navLinks.appendChild(adminMovieLink);
        }
    } else {
        authSection.innerHTML = `
            <button onclick="window.location.href='login.html'" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">Đăng nhập</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('user');
    showNotification('Đăng xuất thành công!', 'success');
    updateNavbar();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Fetch Movies with Pagination
const PAGE_SIZE = 8;
async function fetchMovies(page = 1) {
    try {
        const response = await fetch('http://localhost:3000/api/movies');
        if (!response.ok) throw new Error(`Lỗi API /api/movies: ${response.statusText}`);
        const movies = await response.json();
        if (!Array.isArray(movies)) throw new Error('Dữ liệu phim không phải mảng');
        const totalPages = Math.ceil(movies.length / PAGE_SIZE);
        currentPage = Math.max(1, Math.min(page, totalPages)); // Update currentPage
        const paginatedMovies = movies.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
        renderMovieList(paginatedMovies, currentPage, totalPages);
    } catch (error) {
        console.error('Lỗi khi tải danh sách phim:', error);
        showNotification('Không thể tải danh sách phim', 'error');
        document.getElementById('movieList').innerHTML = '<p class="text-gray-400 text-center">Lỗi khi tải danh sách phim</p>';
    }
}

// Fetch Genres for Dropdown
async function fetchGenres() {
    try {
        const response = await fetch('http://localhost:3000/api/genres');
        if (!response.ok) throw new Error(`Lỗi API /api/genres: ${response.statusText}`);
        const genres = await response.json();
        if (!Array.isArray(genres)) throw new Error('Dữ liệu thể loại không phải mảng');
        const genreSelect = document.getElementById('movieGenre');
        genreSelect.innerHTML = ''; // Xóa các option cũ
        genres.forEach(genre => {
            if (genre.id && genre.name) {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                genreSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Lỗi khi tải thể loại:', error);
        showNotification('Không thể tải danh sách thể loại', 'error');
    }
}

// Render Movie List with Pagination
function renderMovieList(movies, currentPage = 1, totalPages = 1) {
    const container = document.getElementById('movieList');
    container.innerHTML = movies.map(movie => `
        <div class="bg-gray-800 rounded-lg overflow-hidden">
            <a href="movie-detail.html?id=${movie.id}">
                <img src="${movie.image_url || 'https://via.placeholder.com/300x180?text=' + encodeURIComponent(movie.title)}" class="w-full h-40 object-cover hover:opacity-80 transition duration-300">
            </a>
            <div class="p-4">
                <h3 class="font-semibold truncate">${movie.title}</h3>
                <p class="text-sm text-gray-400">Năm: ${movie.year || 'N/A'}</p>
                <p class="text-sm text-gray-400 truncate">Mô tả: ${movie.description || 'Không có mô tả'}</p>
                <div class="flex gap-2 mt-4">
                    <button onclick="openEditMovieModal(${movie.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button onclick="deleteMovie(${movie.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    renderPagination(currentPage, totalPages);
}

// Render Pagination
function renderPagination(currentPage, totalPages) {
    const container = document.getElementById('movieList');
    if (totalPages <= 1) return;
    let html = '<div class="pagination-container flex justify-center items-center gap-2 mt-8 col-span-full">';
    html += `<button class="pagination-button prev-button bg-gray-700 px-3 py-1 rounded" ${currentPage === 1 ? 'disabled' : ''} onclick="gotoPage(${currentPage - 1})">Trước</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-button page-button ${i === currentPage ? 'bg-orange-500' : 'bg-gray-700'} px-3 py-1 rounded" ${i === currentPage ? 'disabled' : ''} onclick="gotoPage(${i})">${i}</button>`;
    }
    html += `<button class="pagination-button next-button bg-gray-700 px-3 py-1 rounded" ${currentPage === totalPages ? 'disabled' : ''} onclick="gotoPage(${currentPage + 1})">Sau</button>`;
    html += '</div>';
    container.insertAdjacentHTML('beforeend', html);
}

// Goto Page
function gotoPage(page) {
    fetchMovies(page);
}

// Open Add Movie Modal
function openAddMovieModal() {
    currentMovieId = null;
    document.getElementById('modalTitle').textContent = 'Thêm phim mới';
    document.getElementById('movieTitle').value = '';
    document.getElementById('movieYear').value = '';
    document.getElementById('movieDescription').value = '';
    document.getElementById('movieImageUrl').value = '';
    document.getElementById('movieVideoUrl').value = '';
    const genreSelect = document.getElementById('movieGenre');
    Array.from(genreSelect.options).forEach(option => option.selected = false); // Bỏ chọn tất cả
    document.getElementById('saveMovieButton').textContent = 'Thêm';
    document.getElementById('movieModal').classList.remove('hidden');
}

// Open Edit Movie Modal
async function openEditMovieModal(movieId) {
    try {
        const response = await fetch(`http://localhost:3000/api/getMovie?id=${movieId}`);
        if (!response.ok) throw new Error(`Lỗi API /api/getMovie: ${response.statusText}`);
        const movie = await response.json();
        currentMovieId = movie.id;
        document.getElementById('modalTitle').textContent = 'Sửa phim';
        document.getElementById('movieTitle').value = movie.title || '';
        document.getElementById('movieYear').value = movie.year || '';
        document.getElementById('movieDescription').value = movie.description || '';
        document.getElementById('movieImageUrl').value = movie.image_url || '';
        document.getElementById('movieVideoUrl').value = movie.video_url || '';
        const genreSelect = document.getElementById('movieGenre');
        Array.from(genreSelect.options).forEach(option => {
            option.selected = movie.genre_ids && movie.genre_ids.includes(parseInt(option.value));
        });
        document.getElementById('saveMovieButton').textContent = 'Lưu';
        document.getElementById('movieModal').classList.remove('hidden');
    } catch (error) {
        console.error('Lỗi khi tải thông tin phim:', error);
        showNotification('Không thể tải thông tin phim', 'error');
    }
}

// Close Modal
function closeMovieModal() {
    document.getElementById('movieModal').classList.add('hidden');
    currentMovieId = null;
}

// Save Movie (Add or Edit)
async function saveMovie() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        showNotification('Bạn không có quyền truy cập', 'error');
        setTimeout(() => window.location.href = 'index.html', 1000);
        return;
    }

    const title = document.getElementById('movieTitle').value.trim();
    const year = parseInt(document.getElementById('movieYear').value);
    const description = document.getElementById('movieDescription').value.trim();
    const image_url = document.getElementById('movieImageUrl').value.trim();
    const video_url = document.getElementById('movieVideoUrl').value.trim();
    const genreSelect = document.getElementById('movieGenre');
    const genre_ids = Array.from(genreSelect.selectedOptions).map(option => parseInt(option.value));

    if (!title || !year || genre_ids.length === 0) {
        showNotification('Vui lòng điền đầy đủ tiêu đề, năm sản xuất và ít nhất một thể loại', 'error');
        return;
    }

    if (!user || !user.email) {
        showNotification('Vui lòng đăng nhập lại với tư cách admin!', 'error');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }

    const movieData = { title, year, description, image_url, video_url, genre_ids, email: user.email };

    try {
        const url = currentMovieId
            ? `http://localhost:3000/api/movies/${currentMovieId}`
            : 'http://localhost:3000/api/movies';
        const method = currentMovieId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi API: ${response.statusText}`);
        }
        const result = await response.json();
        showNotification(currentMovieId ? 'Sửa phim thành công!' : 'Thêm phim thành công!', 'success');
        closeMovieModal();
        fetchMovies(currentPage); // Stay on current page
    } catch (error) {
        console.error('Lỗi khi lưu phim:', error);
        showNotification(`Không thể ${currentMovieId ? 'sửa' : 'thêm'} phim: ${error.message}`, 'error');
    }
}

// Delete Movie
async function deleteMovie(movieId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        showNotification('Bạn không có quyền truy cập', 'error');
        setTimeout(() => window.location.href = 'index.html', 1000);
        return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa phim này?')) return;

    if (!user || !user.email) {
        showNotification('Vui lòng đăng nhập lại với tư cách admin!', 'error');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }

    const deleteData = { email: user.email };

    try {
        const response = await fetch(`http://localhost:3000/api/movies/${movieId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deleteData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi API: ${response.statusText}`);
        }
        showNotification('Xóa phim thành công!', 'success');
        fetchMovies(currentPage); // Stay on current page
    } catch (error) {
        console.error('Lỗi khi xóa phim:', error);
        showNotification(`Không thể xóa phim: ${error.message}`, 'error');
    }
}

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    const user = checkAdminRole();
    if (user) {
        fetchGenres();
        fetchMovies();
    }
});