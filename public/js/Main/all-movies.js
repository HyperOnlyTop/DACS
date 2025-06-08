const PAGE_SIZE = 12;

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

    const existingAdminLinks = document.querySelectorAll('#adminAccountLink, #adminMovieLink');
    existingAdminLinks.forEach(link => link.remove());

    if (user && user.name && user.id) {
        authSection.innerHTML = `
            <span class="text-white">👋 Xin chào, <strong>${user.name}</strong></span>
            <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Đăng xuất</button>
        `;
        if (user.role === 'admin') {
            const adminAccountLink = document.createElement('a');
            adminAccountLink.href = "admin.html";
            adminAccountLink.id = 'adminAccountLink';
            adminAccountLink.textContent = "Quản lý tài khoản";
            adminAccountLink.className = "text-white hover:text-orange-500";
            navLinks.appendChild(adminAccountLink);

            const adminMovieLink = document.createElement('a');
            adminMovieLink.href = "admin-movie.html";
            adminMovieLink.id = 'adminMovieLink';
            adminMovieLink.textContent = "Quản lý phim";
            adminMovieLink.className = "text-white hover:text-orange-500";
            navLinks.appendChild(adminMovieLink);
        }
    } else {
        authSection.innerHTML = `
            <button onclick="openIframe('login.html')" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">Đăng nhập</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('user');
    showNotification('Đăng xuất thành công!', 'success');
    updateNavbar();
}

// Render Movie Card
function renderMovieCard(movie) {
    return `
        <div class="movie-card bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
            <img src="${movie.image_url || 'https://via.placeholder.com/300x180?text=' + encodeURIComponent(movie.title)}" class="w-full h-60 object-cover" />
            <div class="p-3">
                <h3 class="font-semibold truncate">${movie.title}</h3>
                <div class="flex justify-between text-sm text-gray-400 mt-1">
                    <span>${movie.year || 'N/A'}</span>
                    <span class="bg-orange-500 text-white px-1 rounded">HD</span>
                </div>
                <p class="text-sm text-gray-400 mt-1"><i class="fas fa-eye"></i> ${movie.views || 0} lượt xem</p>
                <div class="flex gap-3 mt-2">
                    <button onclick="event.stopPropagation(); window.location.href='watch.html?id=${movie.id}'"
                            class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm flex items-center gap-1">
                        <i class="fas fa-play"></i> Xem ngay
                    </button>
                    <button onclick="event.stopPropagation(); window.location.href='movie-detail.html?id=${movie.id}'"
                            class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm flex items-center gap-1">
                        <i class="fas fa-info-circle"></i> Chi tiết
                    </button>
                </div>
            </div>
        </div>`;
}

// Render Pagination
function renderPagination(currentPage, totalPages, type) {
    const pagination = document.getElementById('pagination');
    if (totalPages <= 0) {
        pagination.innerHTML = '';
        return;
    }

    // Determine the range of page numbers to display (max 3 pages)
    const maxPagesToShow = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Generate page number buttons
    const pageButtons = [];
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        pageButtons.push(`
            <button onclick="fetchMovies('${type}', ${i})"
                    class="pagination-button page-button ${isActive ? 'active' : ''}"
                    ${isActive ? 'disabled' : ''}>
                ${i}
            </button>
        `);
    }

    // Render the pagination with Previous, page numbers, and Next buttons
    pagination.innerHTML = `
        <button onclick="fetchMovies('${type}', ${currentPage - 1})"
                class="pagination-button prev-button"
                ${currentPage === 1 ? 'disabled' : ''}>
            Trước
        </button>
        ${pageButtons.join('')}
        <button onclick="fetchMovies('${type}', ${currentPage + 1})"
                class="pagination-button next-button"
                ${currentPage === totalPages ? 'disabled' : ''}>
            Sau
        </button>
    `;
}

// Fetch Movies
async function fetchMovies(type, page = 1) {
    try {
        let movies = [];
        let title = '';
        const urlParams = new URLSearchParams(window.location.search);
        const keyword = urlParams.get('keyword');
        if (type === 'search' && keyword) {
            // Gọi API tìm kiếm phim
            const res = await fetch(`http://localhost:3000/api/movies/search?keyword=${encodeURIComponent(keyword)}`);
            if (!res.ok) throw new Error('Lỗi API tìm kiếm phim');
            movies = await res.json();
            title = `Kết quả tìm kiếm cho: "${keyword}"`;
        } else {
            const response = await fetch('http://localhost:3000/api/movies');
            if (!response.ok) throw new Error(`Lỗi API /api/movies: ${response.status} ${response.statusText}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                movies = data;
            } else if (data && Array.isArray(data.data)) {
                movies = data.data;
            } else if (data && Array.isArray(data.movies)) {
                movies = data.movies;
            } else {
                movies = [];
            }
            switch (type) {
                case 'new':
                    movies = movies.filter(m => m.year >= 2022).sort((a, b) => (b.year || 0) - (a.year || 0));
                    title = 'Phim mới';
                    break;
                case 'recent':
                    movies = movies.sort((a, b) => {
                        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
                        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
                        return dateB - dateA;
                    });
                    if (movies.every(movie => !movie.created_at)) {
                        movies.sort((a, b) => (b.id || 0) - (a.id || 0));
                    }
                    title = 'Phim mới cập nhật';
                    break;
                case 'popular':
                    movies = movies.sort((a, b) => (b.views || 0) - (a.views || 0));
                    title = 'Phim phổ biến';
                    break;
                default:
                    throw new Error('Loại phim không hợp lệ');
            }
        }
        // Calculate pagination
        const totalMovies = movies.length;
        const totalPages = Math.ceil(totalMovies / PAGE_SIZE);
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const start = (currentPage - 1) * PAGE_SIZE;
        const paginatedMovies = movies.slice(start, start + PAGE_SIZE);

        // Update URL with page parameter
        const url = new URL(window.location);
        url.searchParams.set('page', currentPage);
        url.searchParams.set('type', type);
        if (type === 'search' && keyword) url.searchParams.set('keyword', keyword);
        window.history.pushState({}, '', url);

        renderMovies(title, paginatedMovies, currentPage, totalPages, type);

        if (totalMovies === 0) {
            showNotification('Không tìm thấy phim phù hợp', 'error');
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        document.getElementById('movieSection').innerHTML = `<p class="text-gray-400 text-center">Lỗi khi tải danh sách phim: ${error.message}</p>`;
        document.getElementById('pagination').innerHTML = '';
        showNotification('Không thể tải danh sách phim', 'error');
    }
}


// Render Movies
function renderMovies(title, movies, currentPage, totalPages, type) {
    const container = document.getElementById('movieSection');
    container.innerHTML = `
        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-6">${title}</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                ${movies.length > 0 ? movies.map(renderMovieCard).join('') : '<p class="text-gray-400 text-center col-span-full">Không có phim để hiển thị.</p>'}
            </div>
        </section>
    `;
    renderPagination(currentPage, totalPages, type);
}



// Iframe Handling
function openIframe(url) {
    try {
        if (!url) throw new Error('Không có URL');
        const iframe = document.getElementById('movieIframe');
        iframe.src = url;
        iframe.onerror = () => showNotification('Lỗi khi tải ! Vui lòng thử lại.', 'error');
        document.getElementById('iframeContainer').classList.remove('hidden');
    } catch (error) {
        console.error('Error opening iframe:', error);
        showNotification('Đã xảy ra lỗi khi mở ', 'error');
    }
}

function closeIframe() {
    const iframeContainer = document.getElementById('iframeContainer');
    const iframe = document.getElementById('movieIframe');
    iframe.src = "";
    iframeContainer.classList.add('hidden');
}


// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const page = parseInt(urlParams.get('page')) || 1;
    if (!type) {
        document.getElementById('movieSection').innerHTML = `<p class="text-gray-400 text-center">Không tìm thấy loại phim.</p>`;
        document.getElementById('pagination').innerHTML = '';
        showNotification('Loại phim không hợp lệ', 'error');
        return;
    }
    fetchMovies(type, page);
});

window.addEventListener('message', (event) => {
    if (event.data.type === 'login-success') {
        localStorage.setItem('user', JSON.stringify(event.data.user));
        closeIframe();
        updateNavbar();
        showNotification('Đăng nhập thành công!', 'success');
    } else if (event.data === 'closeIframe') {
        closeIframe();
    }
});

function showDonateModal() {
            const modal = document.getElementById('donateModal');
            modal.style.display = 'flex';
        }

        function closeDonateModal() {
            const modal = document.getElementById('donateModal');
            modal.style.display = 'none';
        }

        // Đóng modal khi nhấn nền mờ
        document.getElementById('donateModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeDonateModal();
            }
        });