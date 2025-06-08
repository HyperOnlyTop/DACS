document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem("user"));

    // Kiểm tra nếu không có user trong localStorage, chuyển hướng đến login
    if (!user) {
        alert("Vui lòng đăng nhập để chỉnh sửa thông tin.");
        window.location.href = "login.html";
        return;
    }

    // Điền thông tin vào form
    document.getElementById('username').value = user.name;
    document.getElementById('email').value = user.email;

    // Bắt sự kiện submit form
    const form = document.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm_password').value.trim();

        // Kiểm tra tên và email
        if (!name || !email) {
            alert('Vui lòng nhập đầy đủ tên và email!');
            return;
        }

        // Kiểm tra định dạng email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            alert('Email không hợp lệ!');
            return;
        }

        // Kiểm tra mật khẩu và xác nhận mật khẩu
        if (password && password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        // Payload với name, email và password (nếu có)
        const payload = { name, email };
        if (password) {
            payload.password = password;
        }

        try {
           // Thay dòng fetch cũ bằng:
const response = await fetch(`http://localhost:3000/api/update-profile/${user.id}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
});


            if (!response.ok) {
                const errorData = await response.json();  // Đọc phản hồi lỗi nếu có
                alert(errorData.message || 'Cập nhật thất bại. Vui lòng thử lại!');
                return;
            }

            const result = await response.json();  // Parse phản hồi JSON hợp lệ
            alert('Cập nhật thành công!');

            // Cập nhật lại localStorage và chuyển hướng
            const updatedUser = { ...user, name, email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.href = "index.html";

        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi cập nhật!');
        }

    });
});
