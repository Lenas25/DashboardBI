const getUsers = async () => {
  try {
    const response = await fetch("/users");
    const users = await response.json();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

const checkExistence = async () => {
  const users = await getUsers();
  if (!localStorage.getItem("key")) {
    window.location.href = "/inicio";
  }
  const user = users.find(
    (u) => u.usuario === JSON.parse(localStorage.getItem("key")).usuario
  );
  if (!user) {
    window.location.href = "/inicio";
  }
  nombreUsuario.innerText = `${user.nombre} ${user.apellido}`;
};

document.addEventListener("DOMContentLoaded", () => {
  checkExistence();
  handleResize();
  const items = document.querySelectorAll("aside .item");
  console.log(items);
    items.forEach((item, index) => {
        if (index < 3) {
            item.addEventListener("click", () => {
                for (const i of items) {
                    i.classList.remove("active");
                }
                item.classList.add("active");
                updateTitle(item.innerText.trim());
            });
        }
    });
});

const nombreUsuario = document.getElementById("nombre-usuario");
const titulo = document.getElementById("tituloDashboard");

const updateTitle = (text) => {
  titulo.innerText = text;
};

const abrirNav = () => {
  document.querySelector("aside").classList.remove("close");
};

const cerrarNav = () => {
  document.querySelector("aside").classList.add("close");
};

const handleResize = () => {
  const aside = document.querySelector("aside");

  if (window.innerWidth >= 1024) {
    aside.classList.remove("close");
  } 
};

const cerrarSesion = () => {
  localStorage.removeItem("key");
  window.location.href = "/inicio";
};
