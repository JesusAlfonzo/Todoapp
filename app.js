const http = require("http");
const db = require("./db");

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
    return;

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
        return;

  } else if (req.url === "/login" && method === "POST") {
        
        // ENVUELVE TODO EN EL TRY PARA CAPTURAR ERRORES DE BD
        try {
            // 1. Esperamos los datos (el await debe estar dentro del try)
            const dataText = await dataBody(req); // Asegúrate que tu función se llame así
            
            console.log("datos crudos recibidos:", dataText);

            // 2. Parsear
            const param = new URLSearchParams(dataText);
            const email = param.get("email");
            const password = param.get("password");

            // 3. Consulta a la Base de Datos
            const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

            // CASO A: El usuario EXISTE
            if (rows.length > 0) {
                const user = rows[0];

                // Verificar contraseña
                if (user.password_hash === password) {
                    res.statusCode = 200;
                    res.end(`<h1>Bienvenido ${user.first_name}!</h1><p>Te logueaste exitosamente</p>`);
                    return; // <--- FINALIZA AQUÍ. IMPORTANTE.
                } else {
                    res.statusCode = 401;
                    res.end(`<h1>Error</h1><p>Contraseña incorrecta</p>`);
                    return; // <--- FINALIZA AQUÍ.
                }
            } 
            
            // CASO B: El usuario NO EXISTE (rows está vacío)
            else {
                res.statusCode = 404; // Cambié a 404 porque no se encontró
                res.end(`<h1>Error</h1><p>Usuario no encontrado</p>`);
                return; // <--- FINALIZA AQUÍ.
            }

            // NOTA: He borrado el paso 4 "Respuesta temporal" porque ya respondimos arriba.
            // Si dejaras código aquí abajo, causaría el error "Write after end".

        } catch (error) {
            // SI ALGO FALLA (ej: BD desconectada), cae aquí
            console.error("Error en el servidor:", error);
            res.statusCode = 500;
            res.end("<h1>Error interno del servidor</h1>");
            return;
        }
    }

  //Register
  // else if (req.url === "/register") {
  //   res.statusCode = 200;
  //   res.end("<h1>Registro de cuenta</h1><p>estas ahora en el register</p>");
  // }

  //Caso de error 404 (se solicito una pagina no existente)
  else {
    res.statusCode = 404;
    res.end(
      "<h1>Error 404</h1><p>La pagina que tratas de consultar no se encontro.</p>"
    );
    return;
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
