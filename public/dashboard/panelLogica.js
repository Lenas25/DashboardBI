const dashboards = [
  {
    title: "Dashboard de ventas y facturación",
    frame:
      '<iframe title="Dashboard de Ventas" width="1140" height="541.25"  src="https://app.powerbi.com/view?r=eyJrIjoiZGQ4MjNiOTgtMDZlNC00YTViLTgxNWUtNzE0OGUyYTgwZTAxIiwidCI6ImM0YTY2YzM0LTJiYjctNDUxZi04YmUxLWIyYzI2YTQzMDE1OCIsImMiOjR9" frameborder="0" allowFullScreen="true" style="border: none; width: 100%; height: 100%;"></iframe>',
  },
  {
    title: "Dashboard de inventario y logística",
    frame:
      '<iframe title="Dashboard de Inventario" width="1140" height="541.25" src="https://app.powerbi.com/view?r=eyJrIjoiZmI4Yjg3NmEtNGJhNi00MDBhLTlhN2MtOGNjNmNlYzljYjdiIiwidCI6ImM0YTY2YzM0LTJiYjctNDUxZi04YmUxLWIyYzI2YTQzMDE1OCIsImMiOjR9" frameborder="0" allowFullScreen="true" style="border: none; width: 100%; height: 100%;"></iframe>',
  },
  {
    title: "Dashboard de comportamiento del cliente",
    frame:
      '<iframe title="Dashboard de Comentarios" width="1140" height="541.25" src="https://app.powerbi.com/view?r=eyJrIjoiNjAwZjBjZDAtYThlNS00MmI1LTgyMzQtYzM0ZDIxNzkzOThkIiwidCI6ImM0YTY2YzM0LTJiYjctNDUxZi04YmUxLWIyYzI2YTQzMDE1OCIsImMiOjR9" frameborder="0" allowFullScreen="true" style="border: none; width: 100%; height: 100%;"></iframe>',
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
  const notificationInventory = document.getElementById("notification-block");
  notificationInventory.innerHTML = "";
};

const changeDashboard = (title) => {
  if (title === "Dashboard de inventario y logística") {
    const notificationInventory = document.getElementById("notification-block");
    notificationInventory.innerHTML = `<div class="notification-item" id="bajoStock">
                  <div class="notification-title">
                    <p>Productos Bajos en Stock</p>
                  </div>
                  <ul id="productosBajoStock">
                  </ul>
                </div>
                <div class="notification-item" id="prontoVencimiento">
                  <div class="notification-title">
                    <p>Productos Pronto a Vencer</p>
                  </div>
                  <ul id="productosProntoVencer">
                  </ul>
                </div>`;
    obtenerBajoStock();
    obtenerProntoVencimiento();
  }

  const dashboardFrame = document.getElementById("dashboard");
  dashboardFrame.innerHTML = "";
  console.log("Frame:", dashboardFrame);
  console.log("Title:", title);
  const dashboard = dashboards.find((d) =>
    d.title.toLowerCase().includes(title.toLowerCase())
  );
  console.log("Dashboard found:", dashboard);
  dashboardFrame.innerHTML = dashboard.frame;
  console.log("Dashboard frame set:", dashboard.frame);
};

const convertirCSVInventario = async () => {
  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUU2Q7lokaj-o5467Wj2BKzgX2XV3tmMkNAXEEIxET584qwM_3RoUdGXNtfkIlvQ/pub?output=csv";

  try {
    const response = await fetch(url);
    const data = await response.text();
    const filas = data.split("\n").map((row) => row.split(","));
    const encabezados = filas.shift();
    encabezados[10] = "fechavencimiento";
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
      li.innerText = `* ${producto.producto} - Stock: ${producto.stockactual}`;
      listProductos.appendChild(li);
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

const obtenerProntoVencimiento = async () => {
  try {
    const inventario = await convertirCSVInventario();
    const notificaciones = inventario.filter((item) => {
      const fechaVencimiento = new Date(item.fechavencimiento);
      const hoy = new Date();
      const diferencia = fechaVencimiento - hoy;
      const diasRestantes = diferencia / (1000 * 60 * 60 * 24);
      return diasRestantes <= 30;
    });
    const listProductos = document.getElementById("productosProntoVencer");
    for (const producto of notificaciones) {
      const li = document.createElement("li");
      let diasRestantes = Math.ceil(
        (new Date(producto.fechavencimiento) - new Date()) /
          (1000 * 60 * 60 * 24)
      );
      if (diasRestantes === 0) {
        li.innerText = `* ${producto.producto} - Vence hoy`;
      } else if (diasRestantes <= 0) {
        diasRestantes *= -1;
        li.innerText = `* ${producto.producto} - Venció hace ${diasRestantes} días`;
      } else {
        li.innerText = `* ${producto.producto} - Vence en ${diasRestantes} días`;
      }

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
  const dashboardframe = document.getElementById("dashboard");
  dashboardframe.innerHTML = dashboards[0].frame;
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
