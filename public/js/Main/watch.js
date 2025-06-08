let movieId = null;
let user = null;

// Get Movie ID from URL
function getMovieId() {
    const urlParams = new URLSearchParams(window.location.search);
    movieId = urlParams.get('id');
    if (!movieId) {
        alert('Thiếu ID phim!');
        setTimeout(() => window.location.href = 'index.html', 1000);
    }
    return movieId;
}

// Update Navbar Authentication
function updateNavbar() {
    const authSection = document.getElementById('authSection');
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
    }

    const navLinks = document.querySelector('.md\\:flex.space-x-8');
    const existingAdminLinks = document.querySelectorAll('#adminAccountLink, #adminMovieLink');
    existingAdminLinks.forEach(link => link.remove());

    if (user && user.name && user.id) {
        authSection.innerHTML = `
            <span class="text-white">👋 Xin chào, <strong>${user.name}</strong></span>
            <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Đăng xuất</button>
        `;
        if (user.role === 'admin') {
            const adminAccountLink = document.createElement('a');
            adminAccountLink.href = 'admin.html';
            adminAccountLink.id = 'adminAccountLink';
            adminAccountLink.textContent = 'Quản lý tài khoản';
            adminAccountLink.className = 'text-white hover:text-orange-500';
            navLinks.appendChild(adminAccountLink);

            const adminMovieLink = document.createElement('a');
            adminMovieLink.href = 'admin-movie.html';
            adminMovieLink.id = 'adminMovieLink';
            adminMovieLink.textContent = 'Quản lý phim';
            adminMovieLink.className = 'text-white hover:text-orange-500';
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

// Fetch Movie Details
async function fetchMovieDetails() {
    try {
        const response = await fetch(`http://localhost:3000/api/getMovie?id=${movieId}`);
        if (!response.ok) throw new Error(`Lỗi API /api/getMovie: ${response.statusText}`);
        const movie = await response.json();

        // Render movie details
        document.getElementById('movie-title').textContent = movie.title || 'Không có tiêu đề';
        document.getElementById('movie-year').textContent = movie.year || 'N/A';
        document.getElementById('movie-views').innerHTML = `<i class="fas fa-eye"></i> ${movie.views || 0} lượt xem`;
        document.getElementById('movie-description').textContent = movie.description || 'Không có mô tả';
        
        // Render genres
        const genresContainer = document.getElementById('movie-genres');
        genresContainer.innerHTML = movie.genres && movie.genres.length > 0
            ? movie.genres.map(genre => `<span class="genre-badge">${genre}</span>`).join('')
            : '<span class="text-gray-400">Không có thể loại</span>';

        // Render video
        const videoPlayer = document.getElementById('video-player');
        videoPlayer.innerHTML = movie.video_url
            ? `<video id="movieVideo" controls><source src="${movie.video_url}" type="video/mp4">Trình duyệt không hỗ trợ video.</video>`
            : '<p class="text-gray-400 text-center">Không có video</p>';

        // Add video event listeners after video is rendered
        const video = document.getElementById('movieVideo');
        if (video) {
            video.addEventListener('pause', savePlaybackTime);
            window.addEventListener('beforeunload', savePlaybackTime);
        }

        // Update views
        await updateViews();

        // Kiểm tra thời gian xem trước đó
        await checkPreviousPlaybackTime();
    } catch (error) {
        console.error('Lỗi khi tải thông tin phim:', error);
        alert('Không thể tải thông tin phim');
    }
}

// Fetch Movie Ratings
async function fetchRatings() {
    try {
        const response = await fetch(`http://localhost:3000/api/ratings/${movieId}${user ? `?user_id=${user.id}` : ''}`);
        if (!response.ok) throw new Error(`Lỗi API /api/ratings: ${response.statusText}`);
        const ratings = await response.json();
        
        // Render ratings
        const ratingElement = document.getElementById('movie-rating');
        ratingElement.innerHTML = `
            <i class="fas fa-star"></i> ${ratings.average_rating || '0.0'} 
            (${ratings.total_ratings || 0} lượt đánh giá)
        `;
    } catch (error) {
        console.error('Lỗi khi tải đánh giá:', error);
        alert('Không thể tải đánh giá');
    }
}

// Update Views
async function updateViews() {
    try {
        const response = await fetch(`http://localhost:3000/api/increment-views/${movieId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movie_id: movieId })
        });
        if (!response.ok) throw new Error(`Lỗi API /api/increment-views: ${response.statusText}`);
    } catch (error) {
        console.error('Lỗi khi cập nhật lượt xem:', error);
    }
}

// Save Watch History and Resume Time
async function saveWatchHistory(movieId, resumeTime = 0) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
            console.error('Không có user id để lưu lịch sử xem');
            return;
        }
        console.log('Saving watch history:', { user_id: user.id, movie_id: movieId, resume_time: Math.floor(resumeTime) });

        const response = await fetch('http://localhost:3000/api/watch-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, movie_id: movieId, resume_time: Math.floor(resumeTime) })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi lưu lịch sử xem');
        }
        console.log('Lịch sử xem đã được lưu thành công');
    } catch (error) {
        console.error('Lỗi khi lưu lịch sử xem:', error);
    }
}
// Lưu thời gian xem video
function savePlaybackTime() {
    const video = document.getElementById('movieVideo');
    if (video && user && user.id) {
        const currentTime = video.currentTime;
        console.log('Saving playback time for movieId:', movieId, 'at:', currentTime);
        if (currentTime > 0) {
            saveWatchHistory(movieId, currentTime);
        }
    }
}

// Kiểm tra và hiển thị thông báo tiếp tục xem
async function checkPreviousPlaybackTime() {
    if (!user || !user.id) {
        console.log('Không có user hoặc user.id');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/watch-history/${user.id}`);
        if (!response.ok) throw new Error(`Lỗi API /api/watch-history: ${response.statusText}`);
        const watchHistory = await response.json();
        console.log('Watch history:', watchHistory);

        if (!Array.isArray(watchHistory) || watchHistory.length === 0) {
            console.log('Không có lịch sử xem cho user:', user.id);
            return;
        }

        // Tìm đúng lịch sử xem theo id (id là id của phim trong dữ liệu trả về)
        const movieHistory = watchHistory.find(item => item.id === parseInt(movieId));
        if (!movieHistory) {
            console.log('Không tìm thấy lịch sử xem cho movieId:', movieId);
            return;
        }

        // Nếu có resume_time > 0 thì hiển thị overlay "Tiếp tục xem" lớn, đẹp, có 2 lựa chọn
        if (movieHistory && movieHistory.resume_time > 0) {
            const videoContainer = document.getElementById('video-player');
            // Xóa overlay cũ nếu có
            let resumeOverlay = document.getElementById('resumeOverlay');
            if (resumeOverlay) resumeOverlay.remove();

            resumeOverlay = document.createElement('div');
            resumeOverlay.id = 'resumeOverlay';
            resumeOverlay.style.position = 'absolute';
            resumeOverlay.style.top = '0';
            resumeOverlay.style.left = '0';
            resumeOverlay.style.width = '100%';
            resumeOverlay.style.height = '100%';
            resumeOverlay.style.background = 'rgba(15,23,42,0.92)';
            resumeOverlay.style.display = 'flex';
            resumeOverlay.style.flexDirection = 'column';
            resumeOverlay.style.justifyContent = 'center';
            resumeOverlay.style.alignItems = 'center';
            resumeOverlay.style.zIndex = '30';

            // Nội dung overlay
            const box = document.createElement('div');
            box.style.background = 'rgba(30,41,59,0.98)';
            box.style.borderRadius = '20px';
            box.style.padding = '40px 32px';
            box.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
            box.style.textAlign = 'center';
            box.style.maxWidth = '90vw';

            const title = document.createElement('h2');
            title.textContent = 'Tiếp tục xem phim?';
            title.style.fontSize = '2.5rem';
            title.style.fontWeight = 'bold';
            title.style.color = '#f97316';
            title.style.marginBottom = '18px';
            box.appendChild(title);

            const time = document.createElement('p');
            time.textContent = `Bạn đã xem đến phút ${Math.floor(movieHistory.resume_time/60)}:${String(Math.floor(movieHistory.resume_time%60)).padStart(2,'0')}`;
            time.style.fontSize = '1.5rem';
            time.style.color = '#fff';
            time.style.marginBottom = '32px';
            box.appendChild(time);

            // Nút chọn
            const btnGroup = document.createElement('div');
            btnGroup.style.display = 'flex';
            btnGroup.style.gap = '32px';
            btnGroup.style.justifyContent = 'center';

            const btnContinue = document.createElement('button');
            btnContinue.textContent = '▶️ Tiếp tục';
            btnContinue.style.background = '#22c55e';
            btnContinue.style.color = '#fff';
            btnContinue.style.fontSize = '1.25rem';
            btnContinue.style.fontWeight = 'bold';
            btnContinue.style.padding = '18px 36px';
            btnContinue.style.border = 'none';
            btnContinue.style.borderRadius = '12px';
            btnContinue.style.cursor = 'pointer';
            btnContinue.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            btnContinue.onmouseover = () => btnContinue.style.background = '#16a34a';
            btnContinue.onmouseout = () => btnContinue.style.background = '#22c55e';
            btnContinue.onclick = () => {
                const video = document.getElementById('movieVideo');
                video.currentTime = movieHistory.resume_time;
                video.play();
                resumeOverlay.remove();
            };

            const btnRestart = document.createElement('button');
            btnRestart.textContent = '⏮️ Xem lại từ đầu';
            btnRestart.style.background = '#f97316';
            btnRestart.style.color = '#fff';
            btnRestart.style.fontSize = '1.25rem';
            btnRestart.style.fontWeight = 'bold';
            btnRestart.style.padding = '18px 36px';
            btnRestart.style.border = 'none';
            btnRestart.style.borderRadius = '12px';
            btnRestart.style.cursor = 'pointer';
            btnRestart.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            btnRestart.onmouseover = () => btnRestart.style.background = '#ea580c';
            btnRestart.onmouseout = () => btnRestart.style.background = '#f97316';
            btnRestart.onclick = () => {
                const video = document.getElementById('movieVideo');
                saveWatchHistory(movieId, 0);
                video.currentTime = 0;
                video.play();
                resumeOverlay.remove();
            };

            btnGroup.appendChild(btnContinue);
            btnGroup.appendChild(btnRestart);
            box.appendChild(btnGroup);
            resumeOverlay.appendChild(box);
            videoContainer.style.position = 'relative';
            videoContainer.appendChild(resumeOverlay);
        } else {
            console.log('resume_time không hợp lệ:', movieHistory?.resume_time);
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra resume_time:', error);
    }
}

// Fetch Comments
async function fetchComments() {
    try {
        const response = await fetch(`http://localhost:3000/api/comments/${movieId}`);
        if (!response.ok) throw new Error(`Lỗi API /api/comments: ${response.statusText}`);
        const comments = await response.json();
        renderComments(comments);
    } catch (error) {
        console.error('Lỗi khi tải bình luận:', error);
        alert('Không thể tải bình luận');
    }
}

// Render Comments
function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    const totalComments = document.getElementById('totalComments');
    
    // Update total comments
    totalComments.textContent = comments.length;

    commentsList.innerHTML = comments.length > 0
        ? comments.map(comment => `
            <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold">${comment.user_name}</span>
                    <span class="text-gray-400 text-sm">${new Date(comment.created_at).toLocaleString('vi-VN')}</span>
                </div>
                <p class="text-gray-300" id="comment-content-${comment.id}">${comment.content}</p>
                ${user && (user.id === comment.user_id || user.role === 'admin') ? `
                    <div class="flex gap-2 mt-2">
                        <button onclick="editComment(${comment.id}, '${encodeURIComponent(comment.content)}')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                            Sửa
                        </button>
                        <button onclick="deleteComment(${comment.id})" 
                                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">
                            Xóa
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('')
        : '<p class="text-gray-400">Chưa có bình luận nào.</p>';
}

// Post Comment
async function postComment() {
    if (!user) {
        alert('Vui lòng đăng nhập để bình luận!');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }

    const content = document.getElementById('commentInput').value.trim();
    if (!content) {
        alert('Vui lòng nhập nội dung bình luận!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, movie_id: movieId, content })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể gửi bình luận.');
        }
        alert('Thêm bình luận thành công!');
        document.getElementById('commentInput').value = '';
        fetchComments();
    } catch (error) {
        console.error('Lỗi khi gửi bình luận:', error);
        alert(error.message || 'Không thể gửi bình luận.');
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
async function updateComment(commentId, content) {
    if (!user) {
        alert('Vui lòng đăng nhập lại!');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, content, role: user.role })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể sửa bình luận.');
        }
        alert('Cập nhật bình luận thành công!');
        fetchComments();
    } catch (error) {
        console.error('Lỗi khi sửa bình luận:', error);
        alert(error.message || 'Không thể sửa bình luận.');
    }
}

// Delete Comment
async function deleteComment(commentId) {
    if (!user) {
        alert('Vui lòng đăng nhập lại!');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

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
        alert('Xóa bình luận thành công!');
        fetchComments();
    } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
        alert(error.message || 'Không thể xóa bình luận.');
    }
}

// Go Back
function goBack() {
    window.history.back();
}

// ====== SEARCH DROPDOWN ======
function setupSearchDropdown() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // Tạo wrapper nếu chưa có
    let wrapper = searchInput.parentElement;
    if (!wrapper.classList.contains('search-wrapper')) {
        wrapper.classList.add('search-wrapper');
        wrapper.style.position = 'relative';
    }

    // Tạo dropdown nếu chưa có
    let dropdown = document.getElementById('searchDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'searchDropdown';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.left = '0';
        dropdown.style.width = '100%';
        dropdown.style.background = '#1e293b';
        dropdown.style.border = '1px solid #f97316';
        dropdown.style.borderTop = 'none';
        dropdown.style.zIndex = '100';
        dropdown.style.maxHeight = '320px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.display = 'none';
        dropdown.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
        dropdown.style.borderRadius = '0 0 12px 12px';
        wrapper.appendChild(dropdown);
    }

    let debounceTimeout = null;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimeout);
        const query = this.value.trim();
        if (!query) {
            dropdown.style.display = 'none';
            dropdown.innerHTML = '';
            return;
        }
        debounceTimeout = setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/movies/search?keyword=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Lỗi tìm kiếm');
                const movies = await res.json();
                if (Array.isArray(movies) && movies.length > 0) {
                    dropdown.innerHTML = movies.map(movie => `
                        <div class="flex items-center gap-3 px-3 py-2 hover:bg-orange-500 hover:text-white cursor-pointer transition-all" style="border-bottom:1px solid #334155;" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
                            <img src="${movie.poster || movie.image_url || 'images/no-image.png'}" alt="${movie.title}" style="width:44px;height:62px;object-fit:cover;border-radius:6px;">
                            <span style="font-size:1.1rem;font-weight:500;">${movie.title}</span>
                        </div>
                    `).join('');
                    dropdown.style.display = 'block';
                } else {
                    dropdown.innerHTML = '<div class="px-3 py-2 text-gray-400">Không tìm thấy phim phù hợp.</div>';
                    dropdown.style.display = 'block';
                }
            } catch (e) {
                dropdown.innerHTML = '<div class="px-3 py-2 text-red-400">Lỗi tìm kiếm.</div>';
                dropdown.style.display = 'block';
            }
        }, 250);
    });

    // Ẩn dropdown khi blur (trừ khi click vào dropdown)
    searchInput.addEventListener('blur', function() {
        setTimeout(() => { dropdown.style.display = 'none'; }, 180);
    });
    dropdown.addEventListener('mousedown', function(e) {
        e.preventDefault(); // Giữ dropdown khi click
    });

    // Xử lý submit form tìm kiếm
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `all-movies.html?type=search&keyword=${encodeURIComponent(query)}`;
            }
        });
    }
}

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    movieId = getMovieId();
    if (movieId) {
        fetchMovieDetails();
        fetchRatings();
        fetchComments();
    }
    setupSearchDropdown(); // <== Thêm dòng này để khởi tạo dropdown
});