// Kiểm tra đăng nhập
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user.id) {
  alert("Vui lòng đăng nhập để xem lịch sử!");
  console.error('Lỗi: Không có user hoặc user.id trong localStorage');
  window.location.href = 'index.html';
}

// Cập nhật thanh điều hướng
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
      <button onclick="window.location.href='index.html'" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">Đăng nhập</button>
    `;
  }
}

function logout() {
  localStorage.removeItem('user');
  alert("Đăng xuất thành công!");
  window.location.href = 'index.html';
}

// Lấy danh sách lịch sử xem từ API
async function fetchHistory() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id) {
    console.error('Lỗi: Không có user.id để lấy lịch sử xem');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/watch-history/${user.id}`);
    if (!response.ok) {
      throw new Error(`Lỗi API /api/watch-history/${user.id}: ${response.status} ${response.statusText}`);
    }
    const movies = await response.json();
    renderHistory(movies);
  } catch (error) {
    console.error('Lỗi khi tải lịch sử xem:', error);
    document.getElementById('historyList').innerHTML = `<p class="text-gray-400 text-center">Lỗi khi tải lịch sử xem: ${error.message}</p>`;
  }
}

// Hiển thị danh sách lịch sử xem
function renderHistory(movies) {
  const container = document.getElementById('historyList');
  if (!movies || movies.length === 0) {
    container.innerHTML = `<p class="text-gray-400 text-center">Bạn chưa xem phim nào.</p>`;
    return;
  }

  const uniqueMoviesMap = new Map();
  movies.forEach(movie => {
    if (!uniqueMoviesMap.has(movie.id)) {
      uniqueMoviesMap.set(movie.id, movie);
    }
  });

  const uniqueMovies = Array.from(uniqueMoviesMap.values());

  container.innerHTML = '';
  uniqueMovies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition';
    card.innerHTML = `
      <div class="relative">
        <a href="movie-detail.html?id=${movie.id}">
          <img src="${movie.image_url || 'https://via.placeholder.com/300x180?text=' + encodeURIComponent(movie.title)}" 
               alt="${movie.title}" class="w-full h-48 object-cover rounded-lg mb-3">
        </a>
      </div>
      <h2 class="text-xl font-semibold mb-1">${movie.title}</h2>
      <p class="text-sm text-gray-400">📅 Năm: ${movie.year || 'N/A'}</p>
      <p class="text-sm text-gray-400">🕒 Xem lúc: ${new Date(movie.watched_at).toLocaleString()}</p>
      <div class="flex gap-2 mt-2">
        <button onclick="showMovieDetails(${movie.id})" 
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition">
          <i class="fas fa-info-circle"></i> Chi tiết
        </button>
        <button onclick="watchAgain(${movie.id})" 
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition">
          <i class="fas fa-play"></i> Xem lại
        </button>
        <button onclick="deleteHistory(${movie.id})"
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition">
          <i class="fas fa-trash"></i> Xóa
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Hàm xóa lịch sử xem một phim
async function deleteHistory(movieId) {
  if (!confirm("Bạn có chắc muốn xóa lịch sử xem phim này?")) return;
  const user = JSON.parse(localStorage.getItem('user'));
  try {
    const res = await fetch(`http://localhost:3000/api/watch-history`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, movie_id: movieId })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Đã xóa lịch sử xem phim!");
      fetchHistory();
    } else {
      alert(data.message || "Xóa thất bại!");
    }
  } catch (err) {
    alert("Lỗi khi xóa lịch sử!");
  }
}

function watchAgain(movieId) {
  window.location.href = `watch.html?id=${movieId}`;
}

function showMovieDetails(movieId) {
  window.location.href = `movie-detail.html?id=${movieId}`;
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  fetchHistory();
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
