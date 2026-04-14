import http.server
import json

class MiHandler(http.server.BaseHTTPRequestHandler):

    def do_GET(self):
        if self.path == "/":
            with open("index.html", "rb") as archivo:
                contenido = archivo.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(contenido)

    def do_POST(self):
        if self.path == "/operar":
            largo = int(self.headers["Content-Length"])
            body = self.rfile.read(largo)
            datos = json.loads(body)

            matriz1 = datos["m1"]
            matriz2 = datos["m2"]
            operacion = datos["tipo"]

            filas = len(matriz1)
            columnas = len(matriz1[0])
            resultado = []

            if operacion == "suma":
                for i in range(filas):
                    fila = []
                    for j in range(columnas):
                        fila.append(matriz1[i][j] + matriz2[i][j])
                    resultado.append(fila)

            elif operacion == "multiplicacion":
                for i in range(filas):
                    fila = []
                    for j in range(columnas):
                        suma = 0
                        for k in range(columnas):
                            suma += matriz1[i][k] * matriz2[k][j]
                        fila.append(suma)
                    resultado.append(fila)

            respuesta = json.dumps({"resultado": resultado}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(respuesta)

    def log_message(self, format, *args):
        pass

print("Servidor corriendo en http://localhost:5000")
servidor = http.server.HTTPServer(("", 5000), MiHandler)
servidor.serve_forever()
