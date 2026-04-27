const http = require("http");
const fs = require("fs");
const path = require("path");

const servidor = http.createServer(function(peticion, respuesta) {

  if (peticion.method === "GET" && peticion.url === "/") {
    const archivo = fs.readFileSync(path.join(__dirname, "index.html"));
    respuesta.writeHead(200, { "Content-Type": "text/html" });
    respuesta.end(archivo);

  } else if (peticion.method === "POST" && peticion.url === "/operar") {
    let cuerpo = "";
    peticion.on("data", function(parte) {
      cuerpo += parte;
    });
    peticion.on("end", function() {
      const datos = JSON.parse(cuerpo);
      const matriz1 = datos.m1;
      const matriz2 = datos.m2;
      const operacion = datos.tipo;

      const filas = matriz1.length;
      const columnas = matriz1[0].length;
      const resultado = [];

      if (operacion === "suma") {
        for (let i = 0; i < filas; i++) {
          const fila = [];
          for (let j = 0; j < columnas; j++) {
            fila.push(matriz1[i][j] + matriz2[i][j]);
          }
          resultado.push(fila);
        }
      } else if (operacion === "multiplicacion") {
        for (let i = 0; i < filas; i++) {
          const fila = [];
          for (let j = 0; j < columnas; j++) {
            let suma = 0;
            for (let k = 0; k < columnas; k++) {
              suma += matriz1[i][k] * matriz2[k][j];
            }
            fila.push(suma);
          }
          resultado.push(fila);
        }
      }

      respuesta.writeHead(200, { "Content-Type": "application/json" });
      respuesta.end(JSON.stringify({ resultado: resultado }));
    });

  } else {
    respuesta.writeHead(404);
    respuesta.end("No encontrado");
  }
});

servidor.listen(3000, function() {
  console.log("Servidor corriendo en http://localhost:3000");
});
