const API_URL = 'http://localhost:3000/api';

const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'admin') {
    alert("❌ Bạn không có quyền truy cập trang quản trị!");
    window.location.href = '/';
}

const currentAdminEmail = user.email;
let users = [];
let editUserId = null;

async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/all-users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentAdminEmail })
        });
        const data = await res.json();
        users = data.users || data;
        renderUsers();
    } catch (err) {
        alert('❌ Lỗi khi tải danh sách tài khoản!');
        console.error(err);
    }
}

function renderUsers() {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';
    users.forEach(user => {
        userTableBody.innerHTML += `
            <tr class="table-row border-t border-gray-700">
                <td class="p-4">${user.name}</td>
                <td class="p-4">${user.email}</td>
                <td class="p-4">${user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</td>
                <td class="p-4 flex gap-2">
                    <button onclick="openEditModal(${user.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button onclick="deleteUser(${user.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </td>
            </tr>`;
    });
}

function openEditModal(id) {
    editUserId = id;
    const user = users.find(u => u.id === id);
    document.getElementById('modalTitle').innerText = 'Chỉnh sửa tài khoản';
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPassword').value = '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userModal').style.display = 'flex';
}

function openAddModal() {
    editUserId = null;
    document.getElementById('modalTitle').innerText = 'Thêm tài khoản';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userRole').value = 'user';
    document.getElementById('userModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

async function saveUser() {
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value.trim();
    const role = document.getElementById('userRole').value;

    if (!name || !email || (!editUserId && !password)) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    try {
        const userToUpdate = users.find(u => u.id === editUserId);
        const payload = { name, role, requesterEmail: currentAdminEmail };
        if (password) payload.password = password;
        // Chỉ gửi email mới nếu nó khác với email hiện tại
        if (userToUpdate && email !== userToUpdate.email) {
            payload.email = email;
        }

        console.log('Payload gửi đi:', payload); // Log để debug

        if (editUserId) {
            const res = await fetch(`${API_URL}/update-user/${editUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Lỗi API: ${res.status}`);
            }
            alert('✅ Cập nhật tài khoản thành công!');
        } else {
            await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            alert('✅ Thêm tài khoản thành công!');
        }
        closeModal();
        fetchUsers();
    } catch (err) {
        alert(`❌ Lỗi khi lưu tài khoản: ${err.message}`);
        console.error(err);
    }
}

async function deleteUser(id) {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) return;

    try {
        await fetch(`${API_URL}/delete-user/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentAdminEmail })
        });
        alert('✅ Xóa tài khoản thành công!');
        fetchUsers();
    } catch (err) {
        alert('❌ Lỗi khi xóa tài khoản!');
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', fetchUsers);