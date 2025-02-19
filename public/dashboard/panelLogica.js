const dashboards = [
  {
    title: "Inventario y Logística",
    frame:
      '<iframe title="Dashboard de Inventario" width="1140" height="541.25" src="https://app.powerbi.com/view?r=eyJrIjoiZmI4Yjg3NmEtNGJhNi00MDBhLTlhN2MtOGNjNmNlYzljYjdiIiwidCI6ImM0YTY2YzM0LTJiYjctNDUxZi04YmUxLWIyYzI2YTQzMDE1OCIsImMiOjR9" frameborder="0" allowFullScreen="true" style="border: none; width: 100%; height: 100%;"></iframe>',
  },
  {
    title: "",
    frame: "",
  },
  {
    title: "",
    frame: "",
  },
];

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

const nombreUsuario = document.getElementById("nombre-usuario");
const titulo = document.getElementById("tituloDashboard");

const updateTitle = (text) => {
  titulo.innerText = text;
};

const changeDashboard = (title) => {
  const dashboardFrame = document.getElementById("dashboard");
  dashboardFrame.innerHTML = "";
  const dashboard = dashboards.find((d) =>
    title.toLowerCase().includes(d.title.toLowerCase())
  );
  if (dashboard) {
    dashboardFrame.innerHTML = dashboard.frame;
  }
};

const convertirCSVInventario = async () => {
  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUU2Q7lokaj-o5467Wj2BKzgX2XV3tmMkNAXEEIxET584qwM_3RoUdGXNtfkIlvQ/pub?output=csv";

  try {
    const response = await fetch(url);
    const data = await response.text();
    const filas = data.split("\n").map((row) => row.split(","));
    const encabezados = filas.shift();
    const inventario = filas.map((fila) => {
      const objeto = {};
      fila.forEach((valor, index) => {
        objeto[encabezados[index]] = valor.trim();
      });
      return objeto;
    });
    return inventario;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

const obtenerBajoStock = async () => {
  try {
    const inventario = await convertirCSVInventario();
    const notificaciones = inventario.filter(
      (item) => Number.parseInt(item.stockactual) <= 30
    );
    const listProductos = document.getElementById("productosBajoStock");
    for (const producto of notificaciones) {
      const li = document.createElement("li");
      li.innerText = `${producto.producto} - Stock: ${producto.stockactual}`;
      listProductos.appendChild(li);
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

const obtenerProntoVencimiento = async () => {
  try {
    const inventario = await convertirCSVInventario();
    const notificaciones = inventario.filter(
      (item) => {
        const fechaVencimiento = new Date(item.fechavencimiento);
        const hoy = new Date();
        const diferencia = fechaVencimiento - hoy;
        return diferencia / (1000 * 60 * 60 * 24) <= 30;
      }
    );  
    const listProductos = document.getElementById("productosProntoVencer");
    for (const producto of notificaciones) {
      const li = document.createElement("li");
      const diasvencimiento = new Date(producto.fechavencimiento) - new Date();
      li.innerText = `${producto.producto} - Vence en: ${diasvencimiento} días`;
      listProductos.appendChild(li);
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

const toggleNav = () => {
  document.querySelector("aside").classList.toggle("close");
};

const toggleNotifications = () => {
  document.querySelector("#notifications").classList.toggle("close");
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

document.addEventListener("DOMContentLoaded", () => {
  checkExistence();
  handleResize();
  obtenerBajoStock();
  obtenerProntoVencimiento();
  const items = document.querySelectorAll("aside .item");
  items.forEach((item, index) => {
    if (index < 3) {
      item.addEventListener("click", () => {
        for (const i of items) {
          i.classList.remove("active");
        }
        item.classList.add("active");
        updateTitle(item.innerText.trim());
        changeDashboard(item.innerText.trim());
      });
    }
  });
});
