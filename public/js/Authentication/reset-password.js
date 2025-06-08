document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetPasswordForm');
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    alert('❌ Token không hợp lệ!');
    window.location.href = '/login.html';
    return;
  }

  // Hàm kiểm tra độ mạnh mật khẩu
  const isStrongPassword = (password) => password.length >= 6; // Yêu cầu tối thiểu 6 ký tự

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!newPassword || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ mật khẩu!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    if (!isStrongPassword(newPassword)) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Mật khẩu đã được cập nhật!');
        window.location.href = '/login.html';
      } else {
        alert(`❌ ${data.message || 'Cập nhật mật khẩu thất bại!'}`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi đặt lại mật khẩu:', error);
      alert('❌ Đã xảy ra lỗi khi kết nối với server! Vui lòng thử lại sau.');
    }
  });
});