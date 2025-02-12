document.addEventListener("DOMContentLoaded", function () {
    const showPasswordCheckbox = document.getElementById("showPassword");
    const passwordInput = document.getElementById("password1");

    if (showPasswordCheckbox && passwordInput) {
        showPasswordCheckbox.addEventListener("change", () => {
            passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
        });
    }
});
