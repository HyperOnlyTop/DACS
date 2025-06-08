document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Hàm kiểm tra định dạng email
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!name || !email || !password) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (name.length > 255 || email.length > 255 || password.length > 255) {
      alert('Dữ liệu không được vượt quá 255 ký tự!');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Email không hợp lệ!');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    try {
      const res = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'user' // 👈 Gửi thêm role mặc định là user
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Đăng ký thất bại!');
        return;
      }

      alert(data.message);
      window.location.href = 'login.html';

    } catch (error) {
      console.error('❌ Lỗi khi gửi yêu cầu:', error);
      alert('Đã xảy ra lỗi khi kết nối tới server!');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Đăng ký';
    }
  });
});
