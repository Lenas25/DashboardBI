const dashboards = [
  {
    title: "Inventario y Logística",
    frame: '<iframe title="Dashboard de Inventario" width="1140" height="541.25" src="https://app.powerbi.com/reportEmbed?reportId=608596d8-f265-4e37-8e10-7ba0683648f3&autoAuth=true&ctid=c4a66c34-2bb7-451f-8be1-b2c26a430158" frameborder="0" allowFullScreen="true" style="border: none; width: 100%; height: 100%;"></iframe>',
  },
  {
    title: "",
    frame: '',
  },
  {
    title: "",
    frame: '',
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
  const dashboard = dashboards.find((d) => title.toLowerCase().includes(d.title.toLowerCase()));
  if (dashboard) {
    dashboardFrame.innerHTML = dashboard.frame;
  }
}

// fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSUU2Q7lokaj-o5467Wj2BKzgX2XV3tmMkNAXEEIxET584qwM_3RoUdGXNtfkIlvQ/pub?output=xlsx')
//   .then(response => response.blob()) // Obtener el archivo como un Blob
//   .then(blob => {
//       // Leer el archivo como un ArrayBuffer
//       var reader = new FileReader();
//       reader.onload = function(e) {
//           var data = new Uint8Array(e.target.result);
//           var workbook = XLSX.read(data, { type: 'array' });

//           // Extraer los datos de la primera hoja
//           var sheetName = workbook.SheetNames[0];
//           var sheet = workbook.Sheets[sheetName];

//           // Convertir los datos a JSON
//           var jsonData = XLSX.utils.sheet_to_json(sheet);
//           console.log(jsonData); // Muestra los datos de la hoja en consola
//       };
//       reader.readAsArrayBuffer(blob);
//   })
//   .catch(error => console.error('Error al cargar el archivo Excel:', error));

const obtenerBajoStock = async () => {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUU2Q7lokaj-o5467Wj2BKzgX2XV3tmMkNAXEEIxET584qwM_3RoUdGXNtfkIlvQ/pub?output=csv";
  
  try {
      const response = await fetch(url);
      const data = await response.text();
      // Convertir CSV a Array de Objetos
      const filas = data.split("\n").map(row => row.split(","));
      const encabezados = filas.shift();
      const inventario = filas.map(fila => {
          const objeto = {};
          fila.forEach((valor, index) => {
              objeto[encabezados[index]] = valor.trim();
          });
          return objeto;
      });

      const notificaciones = inventario.filter(item => Number.parseInt(item.stockactual) <= 30);

      console.log("Productos con stock bajo:", notificaciones);
  } catch (error) {
      console.error("Error al obtener los datos:", error);
  }
}

const toggleNav = () => {
  document.querySelector("aside").classList.toggle("close");
}

const toggleNotifications = () => {
  document.querySelector("#notifications").classList.toggle("close");
}

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