let editingUser = null;

async function submitForm() {
    const formData = {
        username: document.getElementById("username").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        location: document.getElementById("location").value,
    };

    const response = await fetch("/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    if (response.ok) {
        await refreshUserData();
        document.getElementById('username').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('address').value = '';
        document.getElementById('location').value = '';
    } else {
        console.error("Lỗi khi gửi dữ liệu người dùng.");
    }
}

async function refreshUserData() {
    const response = await fetch("/api/users");
    const userData = await response.json();

    const tableBody = document.querySelector("#userData tbody");
    tableBody.innerHTML = "";

    userData.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.phone}</td>
            <td>${user.address}</td>
            <td>${user.location}</td>
            <td>
                <button class="edit-button" 
                    data-username="${user.username}" 
                    data-phone="${user.phone}" 
                    data-address="${user.address}" 
                    data-location="${user.location}" 
                    onclick="editUser('${user.username}', '${user.phone}', '${user.address}', '${user.location}')">
                    Chỉnh sửa
                </button>
                <button class="delete-button" 
                    data-username="${user.username}" 
                    onclick="deleteUser('${user.username}')">
                    Xoá
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    addEditAndDeleteEventListeners();
}

function addEditAndDeleteEventListeners() {
    const editButtons = document.querySelectorAll('.edit-button');
    const deleteButtons = document.querySelectorAll('.delete-button');

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            const phone = this.getAttribute('data-phone');
            const address = this.getAttribute('data-address');
            const location = this.getAttribute('data-location');
            editUser(username, phone, address, location);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            deleteUser(username);
        });
    });
}

function editUser(username, phone, address, location) {
    document.getElementById('editUsername').value = username;
    document.getElementById('editPhone').value = phone;
    document.getElementById('editAddress').value = address;
    document.getElementById('editLocation').value = location;

    editingUser = username;
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('userForm').style.display = 'none';
}

async function saveEdit() {
    const formData = {
        phone: document.getElementById("editPhone").value,
        address: document.getElementById("editAddress").value,
        location: document.getElementById("editLocation").value,
    };

    const response = await fetch(`/api/users/${encodeURIComponent(editingUser)}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    if (response.ok) {
        editingUser = null;
        document.getElementById('editForm').style.display = 'none';
        document.getElementById('userForm').style.display = 'block';
        await refreshUserData();
    } else {
        console.error(`Lỗi khi cập nhật thông tin người dùng ${editingUser}.`);
    }
}

function cancelEdit() {
    editingUser = null;
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('userForm').style.display = 'block';
}

async function deleteUser(username) {
    const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        method: "DELETE",
    });

    if (response.ok) {
        await refreshUserData();
    } else {
        console.error(`Lỗi khi xoá người dùng ${username}.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    refreshUserData();
});
