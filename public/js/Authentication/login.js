document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');

  // Hàm validate email đơn giản
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Tự động điền thông tin nếu đã lưu
  const savedEmail = localStorage.getItem('savedEmail');
  const savedPassword = localStorage.getItem('savedPassword');
  if (savedEmail && savedPassword) {
    emailInput.value = savedEmail;
    passwordInput.value = savedPassword;
    rememberMeCheckbox.checked = true;
  }

  // Xử lý đăng nhập
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }
    if (!isValidEmail(email)) {
      alert('Vui lòng nhập email hợp lệ!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Lưu thông tin người dùng
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('email', data.user.email);

        // Lưu email và mật khẩu nếu chọn "Ghi nhớ mật khẩu"
        if (rememberMeCheckbox.checked) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password); 
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }

        alert('✅ Đăng nhập thành công!');
        // Chỉ gửi message nếu parent window có thể nhận
        if (window.parent && window.parent.postMessage) {
          window.parent.postMessage({ type: 'login-success', user: data.user }, '*');
        }
        window.location.href = 'index.html';
      } else {
        alert(`❌ ${data.message || 'Đăng nhập thất bại!'}`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi đăng nhập:', error);
      alert('❌ Đã xảy ra lỗi khi kết nối với server! Vui lòng kiểm tra mạng hoặc thử lại sau.');
    }
  });

  // Mở modal quên mật khẩu
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.classList.remove('hidden');
  });

  // Đóng modal quên mật khẩu
  window.closeForgotPasswordModal = function () {
    forgotPasswordModal.classList.add('hidden');
    document.getElementById('forgotEmail').value = '';
  };

  // Xử lý quên mật khẩu
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('forgotEmail').value.trim();

    if (!email) {
      alert('Vui lòng nhập email!');
      return;
    }
    if (!isValidEmail(email)) {
      alert('Vui lòng nhập email hợp lệ!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Yêu cầu khôi phục đã được gửi! Vui lòng kiểm tra email của bạn.');
        closeForgotPasswordModal();
      } else {
        alert(`❌ ${data.message || 'Yêu cầu khôi phục thất bại!'}`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi gửi yêu cầu khôi phục:', error);
      alert('❌ Đã xảy ra lỗi khi kết nối với server! Vui lòng kiểm tra mạng hoặc thử lại sau.');
    }
  });
});