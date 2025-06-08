let selectedRating = 0; // Store the user's selected rating
let carouselIndex = 0; // Track carousel position

// Update Navbar
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
    const existingAdminMovieLink = document.getElementById('adminMovieLink');
    if (existingAdminMovieLink) existingAdminMovieLink.remove();

    if (user && user.name) {
        authSection.innerHTML = `
            <span class="text-white">👋 Xin chào, <strong>${user.name}</strong></span>
            <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Đăng xuất</button>
        `;
        if (user.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = "admin.html";
            adminLink.id = 'adminLink';
            adminLink.textContent = "Quản lý tài khoản";
            adminLink.className = "text-white hover:text-orange-500";
            navLinks.appendChild(adminLink);

            const adminMovieLink = document.createElement('a');
            adminMovieLink.href = "admin-movie.html";
            adminMovieLink.id = 'adminMovieLink';
            adminMovieLink.textContent = "Quản lý phim";
            adminMovieLink.className = "text-white hover:text-orange-500";
            navLinks.appendChild(adminMovieLink);
        }
    } else {
        authSection.innerHTML = `
            <button onclick="window.location.href='login.html'" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">Đăng nhập</button>
        `;
    }
}

// Logout
function logout() {
    localStorage.removeItem('user');
    alert('Đăng xuất thành công!');
    setTimeout(() => window.location.href = 'index.html', 1000);
}

// Fetch Movie Details and Ratings
async function fetchMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId || isNaN(movieId)) {
        alert('ID phim không hợp lệ!');
        setTimeout(() => window.location.href = 'index.html', 1000);
        return;
    }

    try {
        const [movieResponse, ratingsResponse] = await Promise.all([
            fetch(`http://localhost:3000/api/getMovie?id=${movieId}`),
            fetch(`http://localhost:3000/api/ratings/${movieId}${localStorage.getItem('user') ? `?user_id=${JSON.parse(localStorage.getItem('user')).id}` : ''}`)
        ]);

        if (!movieResponse.ok) {
            const errorData = await movieResponse.json();
            throw new Error(errorData.message || 'Không thể lấy thông tin phim.');
        }
        if (!ratingsResponse.ok) {
            const errorData = await ratingsResponse.json();
            throw new Error(errorData.message || 'Không thể lấy thông tin đánh giá.');
        }

        const movie = await movieResponse.json();
        const ratings = await ratingsResponse.json();

        console.log('Movie data:', movie);
        renderMovieDetails(movie, ratings);
        fetchComments(movieId);
        fetchRecommendedMovies();
    } catch (error) {
        console.error('Lỗi khi tải thông tin phim:', error);
        alert(error.message || 'Lỗi khi tải thông tin phim.');
        setTimeout(() => window.location.href = 'index.html', 1000);
    }
}

// Render Movie Details
function renderMovieDetails(movie, ratings) {
    const container = document.getElementById('movie-details');
    container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6">
            <img src="${movie.image_url || 'https://via.placeholder.com/300x450?text=' + encodeURIComponent(movie.title)}" 
                 alt="${movie.title}" class="w-full md:w-1/3 h-96 object-cover rounded-lg">
            <div class="flex-1">
                <h1 class="text-3xl font-bold mb-2">${movie.title}</h1>
                <p class="text-gray-400 mb-2"><i class="fas fa-calendar-alt"></i> Năm: ${movie.year || 'N/A'}</p>
                <p class="text-gray-400 mb-2"><i class="fas fa-eye"></i> Lượt xem: ${movie.views.toLocaleString()}</p>
                <p class="text-gray-400 mb-2"><i class="fas fa-star"></i> Đánh giá trung bình: ${ratings.average_rating} (${ratings.total_ratings} lượt)</p>
                <p class="text-gray-400 mb-2"><i class="fas fa-tags"></i> Thể loại: ${
                    Array.isArray(movie.genres) && movie.genres.length > 0
                        ? movie.genres.map(genre => `<span class="genre-badge">${genre}</span>`).join('')
                        : 'Không có'
                }</p>
                <p class="text-gray-300 mb-4">${movie.description || 'Không có mô tả'}</p>
                <div class="flex gap-3">
                    <button onclick="watchMovie()" 
                            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-1">
                        <i class="fas fa-play"></i> Xem ngay
                    </button>
                    <button onclick="followMovie(${movie.id})" 
                            class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-1">
                        <i class="fas fa-star"></i> Theo dõi
                    </button>
                </div>
                <!-- Star Rating -->
                <div class="mt-6">
                    <h2 class="text-xl font-semibold mb-2">⭐ Đánh giá phim</h2>
                    <div id="starRating" class="flex gap-2 mb-2">
                        ${[1, 2, 3, 4, 5].map(i => `
                            <i class="fas fa-star text-2xl cursor-pointer ${ratings.user_rating && i <= ratings.user_rating ? 'text-yellow-400' : 'text-gray-500'} hover:text-yellow-400" 
                               data-value="${i}" onclick="selectRating(${i})"></i>
                        `).join('')}
                    </div>
                    <button onclick="submitRating(${movie.id})"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                        Gửi đánh giá
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Select Rating
function selectRating(value) {
    selectedRating = value;
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach(star => {
        const starValue = parseInt(star.getAttribute('data-value'));
        star.classList.toggle('text-yellow-400', starValue <= value);
        star.classList.toggle('text-gray-500', starValue > value);
    });
}

// Submit Rating
async function submitRating(movieId) {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
    }
    if (!user) {
        alert('Bạn cần đăng nhập để đánh giá phim!');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    if (!selectedRating) {
        alert('Vui lòng chọn số sao!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, movie_id: movieId, rating: selectedRating })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể gửi đánh giá.');
        }
        const result = await response.json();
        alert(result.message);
        fetchMovieDetails();
    } catch (error) {
        console.error('Lỗi khi gửi đánh giá:', error);
        alert(error.message || 'Lỗi khi gửi đánh giá.');
    }
}

// Fetch Comments
async function fetchComments(movieId) {
    try {
        const response = await fetch(`http://localhost:3000/api/comments/${movieId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể lấy bình luận.');
        }
        const comments = await response.json();
        renderComments(comments);
    } catch (error) {
        console.error('Lỗi khi tải bình luận:', error);
        alert(error.message || 'Lỗi khi tải bình luận.');
    }
}

// Render Comments
function renderComments(comments) {
    const container = document.getElementById('comments-list');
    const totalComments = document.getElementById('totalComments');
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
    }

    totalComments.textContent = comments.length;

    container.innerHTML = comments.length ? comments.map(comment => `
        <div class="bg-gray-700 rounded-lg p-4">
            <div class="flex justify-between mb-2">
                <span class="font-semibold">${comment.user_name}</span>
                <span class="text-gray-400 text-sm">${new Date(comment.created_at).toLocaleString('vi-VN')}</span>
            </div>
            <p class="text-gray-300" id="comment-content-${comment.id}">${comment.content}</p>
            <div class="flex gap-2 mt-2">
                ${
                    user && (user.role === 'admin' || user.id == comment.user_id)
                        ? `
                            <button onclick="editComment(${comment.id}, '${encodeURIComponent(comment.content)}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">Sửa</button>
                            <button onclick="deleteComment(${comment.id})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">Xóa</button>
                        `
                        : ''
                }
            </div>
        </div>
    `).join('') : '<p class="text-gray-400">Chưa có bình luận nào.</p>';
}

// Post Comment
async function postComment() {
    const content = document.getElementById('commentInput').value.trim();
    if (!content) {
        alert('Vui lòng nhập nội dung bình luận!');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
    }

    if (!user) {
        alert('Vui lòng đăng nhập để gửi bình luận!');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, movie_id: movieId, content })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể gửi bình luận.');
        }
        const result = await response.json();
        alert(result.message);
        document.getElementById('commentInput').value = '';
        fetchComments(movieId);
    } catch (error) {
        console.error('Lỗi khi gửi bình luận:', error);
        alert(error.message || 'Lỗi khi gửi bình luận.');
    }
}

// Edit Comment
function editComment(commentId, content) {
    const decodedContent = decodeURIComponent(content);
    const newContent = prompt('Sửa bình luận:', decodedContent);
    if (newContent === null || newContent.trim() === decodedContent) return;
    updateComment(commentId, newContent.trim());
}

// Update Comment
async function updateComment(commentId, newContent) {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
    }
    if (!user) {
        alert('Bạn cần đăng nhập để sửa bình luận!');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, content: newContent, role: user.role })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể sửa bình luận.');
        }
        const result = await response.json();
        alert(result.message);
        const urlParams = new URLSearchParams(window.location.search);
        fetchComments(urlParams.get('id'));
    } catch (error) {
        console.error('Lỗi khi sửa bình luận:', error);
        alert(error.message || 'Lỗi khi sửa bình luận.');
    }
}

// Delete Comment
async function deleteComment(commentId) {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
    }
    if (!user) {
        alert('Bạn cần đăng nhập để xóa bình luận!');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, role: user.role })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể xóa bình luận.');
        }
        const result = await response.json();
        alert(result.message);
        const urlParams = new URLSearchParams(window.location.search);
        fetchComments(urlParams.get('id'));
    } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
        alert(error.message || 'Lỗi khi xóa bình luận.');
    }
}

// Follow Movie
async function followMovie(movieId) {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
    }
    if (!user) {
        alert('Bạn cần đăng nhập để theo dõi phim!');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, movie_id: movieId })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi theo dõi phim.');
        }
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error('Lỗi khi theo dõi phim:', error);
        alert(error.message || 'Lỗi khi theo dõi phim.');
    }
}

// Watch Movie
function watchMovie() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId) {
        alert('Không tìm thấy ID phim.');
        return;
    }
    window.location.href = `watch.html?id=${movieId}`;
}

// Fetch Recommended Movies
async function fetchRecommendedMovies() {
    try {
        const response = await fetch('http://localhost:3000/api/ranking');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể lấy danh sách phim gợi ý.');
        }
        const movies = await response.json();
        renderRecommendedMovies(movies.slice(0, 10)); // Lấy 10 phim
    } catch (error) {
        console.error('Lỗi khi tải phim gợi ý:', error);
        document.getElementById('recommended-movies').innerHTML = `
            <p class="text-gray-400">Không tải được phim gợi ý.</p>
        `;
    }
}

// Render Recommended Movies (Carousel)
function renderRecommendedMovies(movies) {
    const container = document.getElementById('recommended-movies');
    container.innerHTML = movies.length ? movies.map(movie => `
        <div class="carousel-item">
            <a href="movie-detail.html?id=${movie.id}">
                <img src="${movie.image_url || 'https://via.placeholder.com/300x450?text=' + encodeURIComponent(movie.title)}" 
                     alt="${movie.title}" class="w-full h-64 object-cover rounded-lg">
                <span class="carousel-title">${movie.title || 'Không có tiêu đề'}</span>
            </a>
        </div>
    `).join('') : '<p class="text-gray-400">Chưa có phim gợi ý.</p>';

    updateCarouselButtons(movies.length);
}

// Scroll Carousel (Loop)
function scrollCarousel(direction) {
    const container = document.getElementById('recommended-movies');
    const items = container.querySelectorAll('.carousel-item');
    const itemWidth = items[0].offsetWidth + 16; // Include padding
    const itemsPerView = window.innerWidth >= 768 ? 4 : 2; // 4 on desktop, 2 on mobile
    const totalItems = items.length;
    const maxIndex = totalItems - itemsPerView;

    // Update carousel index for looping
    carouselIndex += direction;
    if (carouselIndex > maxIndex) {
        carouselIndex = 0; // Loop to start
    } else if (carouselIndex < 0) {
        carouselIndex = maxIndex; // Loop to end
    }

    container.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
    updateCarouselButtons(totalItems);
}

// Update Carousel Buttons Visibility
function updateCarouselButtons(totalItems) {
    const leftButton = document.querySelector('.carousel-button.left');
    const rightButton = document.querySelector('.carousel-button.right');
    const itemsPerView = window.innerWidth >= 768 ? 4 : 2;

    // Always show buttons if there are enough items to scroll
    if (totalItems > itemsPerView) {
        leftButton.style.display = 'block';
        rightButton.style.display = 'block';
    } else {
        // Hide buttons if not enough items to scroll
        leftButton.style.display = 'none';
        rightButton.style.display = 'none';
    }
}
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

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    fetchMovieDetails();
});