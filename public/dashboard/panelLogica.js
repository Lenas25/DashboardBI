const dashboards = [
  {
    title: "Dashboard de Ventas",
    frame:
      '<iframe title="Dashboard de Ventas" width="1140" height="541.25"  src="https://app.powerbi.com/view?r=eyJrIjoiZGQ4MjNiOTgtMDZlNC00YTViLTgxNWUtNzE0OGUyYTgwZTAxIiwidCI6ImM0YTY2YzM0LTJiYjctNDUxZi04YmUxLWIyYzI2YTQzMDE1OCIsImMiOjR9" frameborder="0" allowFullScreen="true" style="border: none; width: 100%; height: 100%;"></iframe>',
  },
  {
    title: "Dashboard de Inventario y Logística",
    frame:
      '<iframe title="Dashboard de Inventario" width="1140" height="541.25" src="https://app.powerbi.com/view?r=eyJrIjoiZmI4Yjg3NmEtNGJhNi00MDBhLTlhN2MtOGNjNmNlYzljYjdiIiwidCI6ImM0YTY2YzM0LTJiYjctNDUxZi04YmUxLWIyYzI2YTQzMDE1OCIsImMiOjR9" frameborder="0" allowFullScreen="true" style="border: none; width: 100%; height: 100%;"></iframe>',
  },
  {
    title: "Dashboard de Comportamiento del Cliente",
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

const changeDashboard = async (title) => {
  const idSede = document.getElementById("sede").value;
  if (title === dashboards[1].title) {
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
    await obtenerBajoStock(idSede);
    await obtenerProntoVencimiento(idSede);
  }

  if (title === dashboards[0].title) {
    const notificationSales = document.getElementById("notification-block");
    notificationSales.innerHTML = `<div class="notification-item" id="diferenciaVentas">
                  <div class="notification-title">
                    <p>Diferencia Ventas Presencial</p>
                  </div>
                  <ul id="ventasPresencial">
                  </ul>
                </div>
                <div class="notification-item" id="prontoVencimiento">
                  <div class="notification-title">
                    <p>Diferencia Ventas Online</p>
                  </div>
                  <ul id="ventasOnline">
                  </ul>
                </div>`;
    await obtenerDiferenciaVentas(idSede);
  }

  const dashboardFrame = document.getElementById("dashboard");
  dashboardFrame.innerHTML = "";
  const dashboard = dashboards.find((d) =>
    d.title.toLowerCase().includes(title.toLowerCase())
  );
  dashboardFrame.innerHTML = dashboard.frame;
};

const convertirCSVInventario = async () => {
  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUU2Q7lokaj-o5467Wj2BKzgX2XV3tmMkNAXEEIxET584qwM_3RoUdGXNtfkIlvQ/pub?gid=1617850259&single=true&output=csv";

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

const convertirCSVVentas = async () => {
  const urlPresencial =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUU2Q7lokaj-o5467Wj2BKzgX2XV3tmMkNAXEEIxET584qwM_3RoUdGXNtfkIlvQ/pub?gid=2123716944&single=true&output=csv";

  const urlOnline =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUU2Q7lokaj-o5467Wj2BKzgX2XV3tmMkNAXEEIxET584qwM_3RoUdGXNtfkIlvQ/pub?gid=354832970&single=true&output=csv";

  try {
    let response = await fetch(urlPresencial);
    let data = await response.text();
    let filas = data.split("\n").map((row) => row.split(","));
    let encabezados = filas.shift();
    const ventasPresenciales = filas.map((fila) => {
      const objeto = {};
      fila.forEach((valor, index) => {
        objeto[encabezados[index]] = valor.trim();
      });
      return objeto;
    });

    response = await fetch(urlOnline);
    data = await response.text();
    filas = data.split("\n").map((row) => row.split(","));
    encabezados = filas.shift();
    const ventasOnline = filas.map((fila) => {
      const objeto = {};
      fila.forEach((valor, index) => {
        objeto[encabezados[index]] = valor.trim();
      });
      return objeto;
    });

    return {
      presencial: ventasPresenciales,
      online: ventasOnline,
    };
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

const convertirCSVSedes = async () => {
  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUU2Q7lokaj-o5467Wj2BKzgX2XV3tmMkNAXEEIxET584qwM_3RoUdGXNtfkIlvQ/pub?gid=1087161123&single=true&output=csv";
  try {
    const response = await fetch(url);
    const data = await response.text();
    const filas = data.split("\n").map((row) => row.split(","));
    const encabezados = filas.shift();
    const sedes = filas.map((fila) => {
      const objeto = {};
      fila.forEach((valor, index) => {
        objeto[encabezados[index]] = valor.trim();
      });
      return objeto;
    });
    return sedes;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

const cargarSedes = async () => {
  const sedes = await convertirCSVSedes();
  const selectSede = document.getElementById("sede");
  for (const sede of sedes) {
    const option = document.createElement("option");
    option.value = sede.idSede;
    option.innerText = sede.nombreSede;
    selectSede.appendChild(option);
  }
};

const parseDate = (dateString) => {
  const [day, month, year] = dateString.trim().split('/');
  return year;
};

const obtenerDiferenciaVentas = async (idSede) => {
  try {
    const data = await convertirCSVVentas();
    const totalVentas = {
      presencial: { 2023: 0, 2024: 0 },
      online: { 2023: 0, 2024: 0 },
    };

    ["presencial", "online"].forEach((tipo) => {
      let ventas = data[tipo];
      if (tipo === "presencial") {
        ventas = ventas.filter((item) => item.idSede === idSede);
      }

      [2023, 2024].forEach((year) => {
        totalVentas[tipo][year] = ventas
          .filter((item) => parseDate(item.fecha) === year.toString())
          .reduce((sum, item) => sum + parseFloat(item.monto_final),0)
      });


    });

    const listVentasPresencial = document.getElementById("ventasPresencial");
    const listVentasOnline = document.getElementById("ventasOnline");

    if (listVentasPresencial) {
      listVentasPresencial.innerHTML = `
        <li>Total 2023: ${totalVentas.presencial[2023].toFixed(2)}</li>
        <li>Total 2024: ${totalVentas.presencial[2024].toFixed(2)}</li>
      `;
    } else {
      console.error("Element with ID 'ventasPresencial' not found.");
    }

    if (listVentasOnline) {
      listVentasOnline.innerHTML = `
        <li>Total 2023: ${totalVentas.online[2023].toFixed(2)}</li>
        <li>Total 2024: ${totalVentas.online[2024].toFixed(2)}</li>
      `;
    } else {
      console.error("Element with ID 'ventasOnline' not found.");
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};
const obtenerBajoStock = async (idSede) => {
  try {
    const data = await convertirCSVInventario();
    const inventario = data.filter((item) => item.idSede === idSede);
    const notificaciones = inventario.filter(
      (item) => Number.parseInt(item.stockactual) <= 30
    );
    const listProductos = document.getElementById("productosBajoStock");
    listProductos.innerHTML = "";
    for (const producto of notificaciones) {
      const li = document.createElement("li");
      li.innerText = `* ${producto.producto} - Stock: ${producto.stockactual}`;
      listProductos.appendChild(li);
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

const obtenerProntoVencimiento = async (idSede) => {
  try {
    const data = await convertirCSVInventario();
    const inventario = data.filter((item) => item.idSede === idSede);
    const notificaciones = inventario.filter((item) => {
      const fechaVencimiento = new Date(item.fechavencimiento);
      const hoy = new Date();
      const diferencia = fechaVencimiento - hoy;
      const diasRestantes = diferencia / (1000 * 60 * 60 * 24);
      return diasRestantes <= 30;
    });
    const listProductos = document.getElementById("productosProntoVencer");
    listProductos.innerHTML = "";
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

const cambiarSede = async (event) => {
  const idSede = event.target.value;
  const title = document.getElementById("tituloDashboard").innerHTML;
  if (title === dashboards[1].title) {
    await obtenerBajoStock(idSede);
    await obtenerProntoVencimiento(idSede);
  }

  if (title === dashboards[0].title) {
    await obtenerDiferenciaVentas(idSede);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  checkExistence();
  handleResize();
  await cargarSedes();
  const dashboardframe = document.getElementById("dashboard");
  dashboardframe.innerHTML = dashboards[0].frame;
  const items = document.querySelectorAll("aside .item");
  const title = document.getElementById("tituloDashboard");
  await changeDashboard(title.innerText);
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
