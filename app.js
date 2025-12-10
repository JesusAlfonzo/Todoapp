const http = require("http");

// A. Creamos el servidor para aceptar peticiones y dar respuestas
const server = http.createServer(async (req, res) => {
  //1. configuramos la cabecera del servidor
  res.setHeader("Content-Type", "text/html", "charset=utf-8");

  const { url, method } = req;

  //2. condicionales para dar respuesta segun el cotenido de la url del usuario

  //Raiz
  if (req.url === "/" && method === "GET") {
    res.statusCode = 200;
    res.end("<h1>Bienvenido a mi todo app</h1><p>Estas en el home</p>");
  }

  //Login
  else if (req.url === "/login" && method === "GET") {
    res.statusCode = 200;
    res.end(`
            <h1>Login</h1>
            <form action="/login" method="POST">
                <input type="text" name="email" placeholder="Tu email"><br>
                <input type="password" name="password" placeholder="Tu clave"><br>
                <button type="submit">Enviar datos</button>
            </form>
        `);
  }

  //Register
  else if (req.url === "/register") {
    res.statusCode = 200;
    res.end("<h1>Registro de cuenta</h1><p>estas ahora en el register</p>");
  }

  //Caso de error 404 (se solicito una pagina no existente)
  else {
    res.statusCode = 404;
    res.end(
      "<h1>Error 404</h1><p>La pagina que tratas de consultar no se encontro.</p>"
    );
  }
});

server.listen(3000, () => {
  console.log("El servidor esta corriendo en http://localhost:3000");
});

// B. Stream y Chunks para manejo de datos al servidor
function dataBody(req) {
  return new Promise((resolve, reject) => {
    //la promise espera a que termine el proceso
    let totalBody = "";

    // 1. Data (escucha los datos)
    //chunk es un buffer binario, lo convertimos a texto y lo acumulamos
    req.on("data", (chunk) => {
      totalBody += chunk.toString();
    });

    // 2. End (termina la transmision)
    req.on("end", () => {
      resolve(totalBody); //esto devuelve el textp completo
    });

    // 3. Manejo basico de errores
    req.on("error", (err) => {
      reject(err);
    });
  });
}
