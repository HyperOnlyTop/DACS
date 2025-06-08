const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user.id) {
  alert("Vui lòng đăng nhập để xem danh sách theo dõi!");
  console.error('Lỗi: Không có user hoặc user.id trong localStorage');
  window.location.href = 'index.html';
}


const itemsPerPage = 8;
let currentPage = 1;
let allMovies = [];

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

async function fetchFollowList() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  try {
    const response = await fetch(`http://localhost:3000/api/follows/${user.id}`);
    if (!response.ok) throw new Error('Không thể lấy danh sách theo dõi.');
    const movies = await response.json();
    allMovies = movies;
    renderFollowList();
    renderPagination();
  } catch (error) {
    alert(error.message || 'Lỗi khi tải danh sách theo dõi.');
    document.getElementById('followList').innerHTML = `<p class="text-gray-400">Đã xảy ra lỗi khi tải danh sách.</p>`;
  }
}

function renderFollowList() {
  const container = document.getElementById('followList');
  container.innerHTML = '';

  if (allMovies.length === 0) {
    container.innerHTML = `<p class="text-gray-400">Bạn chưa theo dõi phim nào.</p>`;
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const moviesToShow = allMovies.slice(start, end);

  moviesToShow.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition';
    card.innerHTML = `
      <a href="movie-detail.html?id=${movie.id}">
        <img src="${movie.image_url || 'https://via.placeholder.com/300x180?text=' + encodeURIComponent(movie.title)}" 
             alt="${movie.title}" class="w-full h-48 object-cover rounded mb-2">
      </a>
      <h2 class="text-lg font-semibold">${movie.title}</h2>
      <p class="text-sm text-gray-400">${movie.description || 'Không có mô tả'}</p>
      <button onclick="unfollowMovie(${movie.id})" 
              class="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition">
        <i class="fas fa-trash"></i> Bỏ theo dõi
      </button>
    `;
    container.appendChild(card);
  });
}

function renderPagination() {
  const totalPages = Math.ceil(allMovies.length / itemsPerPage);
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = '';

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded-md mx-1 ${
      i === currentPage ? "bg-orange-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
    }`;
    btn.onclick = () => {
      currentPage = i;
      renderFollowList();
      renderPagination();
    };
    paginationContainer.appendChild(btn);
  }
}

async function unfollowMovie(movieId) {
  const user = JSON.parse(localStorage.getItem('user'));
  try {
    const response = await fetch('http://localhost:3000/api/unfollow', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, movie_id: movieId })
    });
    if (!response.ok) throw new Error('Không thể bỏ theo dõi.');
    const result = await response.json();
    alert(result.message);
    fetchFollowList();
  } catch (error) {
    alert(error.message || 'Lỗi khi bỏ theo dõi phim.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  fetchFollowList();
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