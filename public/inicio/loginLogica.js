document.addEventListener("DOMContentLoaded", () => {
    const showPasswordCheckbox = document.getElementById("showPassword");
    const passwordInput = document.getElementById("password");

    if (showPasswordCheckbox && passwordInput) {
        showPasswordCheckbox.addEventListener("change", () => {
            passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
        });
    }
});

const verificar = async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    if (usuario === '' || password === '') {
        const error = document.getElementById('error');
        error.innerText = 'Todos los campos son obligatorios';
        return false;
    }

    try {
        const response = await fetch('/users');
        const users = await response.json();
        const user = users.find(u => u.usuario === usuario && u.password === password);

        if (!user) {
            const error = document.getElementById('error');
            error.innerText = 'Usuario o contraseña incorrectos';
            return false;
        }

        localStorage.setItem('key', JSON.stringify(user));
        window.location.href = '/dashboard';
        return true;
    } catch (error) {
        console.error('Error fetching users:', error);
        const errorElement = document.getElementById('error');
        errorElement.innerText = 'Error al verificar los usuarios';
        return false;
    }
}


