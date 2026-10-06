# Reservas de coworking

Este archivo separa dos entregas: **lo que ya estaba hecho** y **lo nuevo de la Unidad 4** (seguridad, autenticación y autorización).

## Para qué sirve el proyecto

El sistema gestiona las reservas de un espacio de coworking. Una persona se registra, inicia sesión y consulta qué salas y escritorios están libres en una fecha. Si hay lugar y le alcanza el saldo, reserva: se descuenta el precio en créditos y ese día el espacio queda ocupado. Si cancela, recupera el saldo y el lugar vuelve a estar libre.

Cada cuenta nueva empieza con 300 créditos y el rol `USUARIO`. Solo ve sus propias reservas. Un `ADMIN` puede publicar salas y escritorios y anotar la reserva de cualquier persona. El acceso usa un token corto (15 minutos) y un refresh token para renovarlo. El servidor limita los intentos de login, acepta solo orígenes de una lista y rechaza entradas con operadores de inyección.

## Qué hay en cada parte

| Parte | Para qué sirve |
| --- | --- |
| `public/` | La pantalla del navegador: registrarse, iniciar sesión, ver salas y reservar o cancelar |
| `src/dominio/` | Las reglas del negocio: créditos, fechas, estados de una reserva, roles |
| `src/aplicacion/` | Los servicios que registran, reservan y autorizan, sin saber si los datos están en memoria o en una base |
| `src/infraestructura/` | Express, los tokens JWT, bcrypt y el guardado en memoria |
| `features/` | Las historias de usuario, escritas en español, que describen el comportamiento esperado |
| `tests/` | Los pasos que ejecutan esas historias contra la API |

## Cómo funcionan los datos

No hay base de datos. Usuarios, espacios, reservas, créditos y refresh tokens viven en mapas de JavaScript, en `src/infraestructura/persistencia/memoria.ts`. Nada se escribe en disco.

Esos datos desaparecen siempre que el proceso se frena. `Ctrl+C`, cerrar la terminal o volver a correr `npm run dev` borra las cuentas y las reservas. Al arrancar de nuevo el sistema vuelve a crear solo esto:

- Sala A (100 créditos), Sala B (80) y Escritorio 1 (40)
- La cuenta de ejemplo `ana@correo.com` con contraseña `clave1234` y 300 créditos

Mientras el servidor sigue abierto, lo que se registra o se reserva se mantiene. Dos navegadores contra el mismo `localhost:3000` ven los mismos datos. Guardar eso entre reinicios es la historia pendiente HU-07: más adelante entraría PostgreSQL por las interfaces de repositorio, sin reescribir los servicios.

## Cómo funcionan los tests

Las pruebas no usan el servidor de `npm run dev` ni la cuenta de Ana. Cada escenario arma una aplicación nueva, vacía, en memoria, y al terminar se descarta. Por eso un test no deja usuarios ni reservas para el siguiente, y tampoco los borra de la pantalla que tenés abierta.

El texto está en `features/`, en formato Cucumber: **Given** el contexto, **When** la acción, **Then** el resultado. Un ejemplo es `features/inicio-de-sesion.feature`. Los pasos en español están implementados en `tests/step_definitions/` y llaman a la API con Supertest, adentro del mismo proceso. `cucumber.js` los carga con ts-node. Antes de cada escenario, `tests/support/hooks.ts` reinicia esa aplicación.

```bash
npm run test:e2e
```

Tiene que terminar en 62 escenarios y 387 pasos, todos pasados. No hace falta que la app esté levantada.

`npm run verificar` es la revisión completa: linter, tipos, compilación y Cucumber. GitHub Actions corre lo mismo en cada push.

## Herramientas utilizadas

| Herramienta | Para qué se usa |
| --- | --- |
| Node.js 20 | Ejecuta el servidor. Hace falta esa versión o una superior |
| TypeScript | Lenguaje del backend, en modo estricto |
| Express | Servidor HTTP y rutas de la API bajo `/api` |
| HTML, CSS y JavaScript | Pantalla en `/` para registrarse, ver la disponibilidad, reservar y cancelar |
| bcryptjs | Guarda las contraseñas con hash y sal. El texto plano no se almacena |
| jsonwebtoken | Firma el access token y el refresh token (JWT, HS256) |
| Cucumber | Pruebas de comportamiento a partir de las historias de usuario, en `features/` |
| Supertest | Hace las llamadas HTTP de esas pruebas, sin levantar el servidor a mano |
| ESLint | Revisa estilo y errores en `src` y `tests` |
| ts-node | Arranca en desarrollo con `npm run dev`, sin compilar antes |
| npm | Instala dependencias y corre los scripts (`dev`, `test:e2e`, `verificar`) |
| GitHub Actions | En cada push corre linter, comprobación de tipos, compilación y Cucumber |
| Persistencia en memoria | No hay base de datos. Usuarios, espacios, reservas y refresh tokens viven en mapas de JavaScript (`src/infraestructura/persistencia/memoria.ts`). Al frenar el servidor se borran. Conectar PostgreSQL es la historia pendiente HU-07 |

## Cómo ejecutarlo

Hace falta Node.js 20 o superior. Abrí una terminal en la carpeta del proyecto (`Proyecto integrador profe narciso`). En Cursor: Terminal → New Terminal. Los comandos de abajo sirven en PowerShell y en bash.

### 1. Instalar dependencias

Una sola vez, o de nuevo cuando cambie `package.json`:

```bash
npm install
```

### 2. Levantar la app

```bash
npm run dev
```

Dejá esa terminal abierta. Cuando aparezca `API de reservas escuchando en http://localhost:3000`, entrá a esa dirección en el navegador. Ahí está la pantalla para registrarte, ver las salas libres y reservar. La API sigue en `/api`.

Para probar sin crear una cuenta, en **Iniciar sesión** ya figuran `ana@correo.com` y `clave1234`. Tocá **Entrar**. Al arrancar también hay tres espacios: Sala A (100 créditos), Sala B (80) y Escritorio 1 (40). Cada cuenta nueva empieza con 300 créditos y el rol `USUARIO`. Si frenás el servidor, esas cuentas y las reservas desaparecen. El detalle está en **Cómo funcionan los datos**.

Para frenarla, en esa misma terminal: `Ctrl+C`.

La versión compilada, si la querés en vez de `npm run dev`:

```bash
npm run build
npm start
```

Variables de la entrega anterior: `PORT` (3000), `TOKEN_SECRET` y `BCRYPT_ROUNDS` (8). Las variables nuevas están en la Unidad 4, más abajo. El modelo está en `.env.example`.

### 3. Correr los tests

El mecanismo está en **Cómo funcionan los tests**. Podés usar otra terminal, o frenar `npm run dev` antes. Solo Cucumber (historias de usuario, las 11 features):

```bash
npm run test:e2e
```

Tiene que terminar así:

```text
62 scenarios (62 passed)
387 steps (387 passed)
```

Verificación completa, la misma que corre GitHub Actions (linter, tipos, compilación y Cucumber):

```bash
npm run verificar
```

---

## Ya estaba hecho

Registro, inicio de sesión, disponibilidad, reserva, cancelación, listado propio, bcrypt con sal y el umbral de 200 ms en las consultas. El catálogo seguía sembrado al arrancar. La persistencia entre reinicios sigue pendiente.

### Historias

| ID | Historia | Estado |
| --- | --- | --- |
| HU-01 | Registro de usuario | Hecho |
| HU-02 | Inicio de sesión | Hecho |
| HU-03 | Consulta de disponibilidad | Hecho |
| HU-04 | Reserva de espacio | Hecho |
| HU-05 | Cancelación de reserva | Hecho |
| HU-06 | Consulta de mis reservas | Hecho |
| HU-NF-01 | Contraseñas con bcrypt y sal | Hecho |
| HU-NF-02 | Consultas en menos de 200 ms | Hecho |
| HU-07 | Persistencia entre reinicios | Pendiente |

**HU-01.** Como visitante, quiero registrarme con nombre, email y contraseña para acceder al sistema. La cuenta responde `201`, no devuelve la contraseña y empieza con 300 créditos. Email repetido: `409`. Contraseña corta, email inválido o nombre vacío: `400`.

**HU-02.** Como usuario registrado, quiero iniciar sesión para acceder a mis reservas. Credenciales válidas: `200` y un token. Contraseña incorrecta o email inexistente: `401` con el mismo mensaje, `credenciales inválidas`.

**HU-03.** Como usuario autenticado, quiero ver qué espacios están libres en una fecha para elegir dónde trabajar. Sin reservas figuran `Disponible`. Con reserva confirmada, `Ocupada` solo ese día. Sin token o con token alterado: `401`. Fecha ausente o mal escrita: `400`.

**HU-04.** Como usuario autenticado, quiero reservar un espacio disponible para tener un lugar de trabajo. Si hay lugar y saldo, la reserva queda `confirmada`, se descuenta el precio y el espacio pasa a `Ocupada`. Si está ocupado: `409` y no se cobra. Si no alcanza el saldo: `400` y el saldo no cambia. Fecha pasada o imposible: `400`.

**HU-05.** Como usuario autenticado, quiero cancelar una reserva propia para liberar el espacio y recuperar el saldo. Pasa a `cancelada`, se reintegra el precio y el espacio vuelve a `Disponible`. Otra persona recibe `403`. Cancelar dos veces: `409`.

**HU-06.** Como usuario autenticado, quiero ver mis reservas para organizar mi agenda. Solo aparecen las propias. Sin reservas, la lista va vacía con `200`. Sin token: `401`.

**HU-NF-01.** Como auditor de seguridad, quiero las contraseñas guardadas con bcrypt y sal. El valor almacenado no es el texto plano, tiene formato bcrypt, verifica la clave original y dos cuentas con la misma contraseña no comparten el hash.

**HU-NF-02.** Como administrador, quiero que las consultas respondan en menos de 200 ms. Lo cumplen `GET /api/salud` y `GET /api/espacios`. El registro queda fuera de ese umbral porque bcrypt consume CPU a propósito.

**HU-07** queda escrita y sin implementar. Hoy los datos se borran al frenar el servidor. La interfaz de repositorios es el punto por donde entraría una base más adelante.

Publicar espacios por la API era HU-08 y estaba pendiente. Pasó a esta entrega, atada al rol `ADMIN`. Está en la sección nueva.

### Pruebas de esa entrega

```text
30 scenarios (30 passed)
195 steps (195 passed)
```

| Archivo | Qué cubre |
| --- | --- |
| `features/registro-de-usuario.feature` | Alta, email duplicado, mayúsculas, contraseña corta, email inválido y nombre vacío |
| `features/inicio-de-sesion.feature` | Login correcto, contraseña incorrecta y email inexistente |
| `features/consulta-de-disponibilidad.feature` | Libre, ocupada solo ese día, sin token, token falso y fecha inválida |
| `features/reserva-de-espacio.feature` | Reserva exitosa, sala ocupada, saldo insuficiente, fecha pasada y fecha imposible |
| `features/cancelacion-de-reserva.feature` | Cancelar y reintegrar, reserva ajena y cancelar dos veces |
| `features/consulta-de-mis-reservas.feature` | Solo las propias, lista vacía y sin token |
| `features/requisitos-no-funcionales.feature` | Hash bcrypt con sal y consultas en menos de 200 ms |

### API de esa entrega

El campo de la contraseña es `contrasena`. Las rutas con token piden `Authorization: Bearer <token>`.

| Método y ruta | Auth | Respuesta |
| --- | --- | --- |
| `GET /api/salud` | no | `{ "estado": "ok" }` |
| `POST /api/usuarios` | no | Usuario público, sin contraseña, saldo 300 |
| `POST /api/sesion` | no | Token y usuario |
| `GET /api/usuarios/yo` | token | Perfil y saldo |
| `GET /api/espacios?fecha=2026-10-15` | token | Espacios con estado `Disponible` u `Ocupada` |
| `POST /api/reservas` | token | Reserva `confirmada` y saldo restante |
| `GET /api/reservas` | token | Solo las reservas de esa persona |
| `POST /api/reservas/:id/cancelacion` | token | Reserva `cancelada` y saldo reintegrado. Otra persona recibe `403` |

Reservar la Sala A descuenta 100 créditos (de 300 a 200) y ese día figura `Ocupada`. Cancelarla devuelve el crédito y la sala queda `Disponible`.

---

## Lo nuevo: Unidad 4. Seguridad, autenticación y autorización

Se sumó el patrón de access token y refresh token firmados como JWT (HS256), roles `USUARIO` y `ADMIN`, la comprobación de dueño del recurso, y el endurecimiento del borde HTTP: CORS con orígenes concretos, límite de intentos en el login y rechazo de entradas con operadores de inyección.

El registro público no acepta `rol` ni `role`. Un administrador se crea por dentro del sistema (las pruebas lo hacen llamando al servicio). Así nadie se asciende solo mandando `ADMIN` en el body.

El access token dura 15 minutos. El refresh token dura 7 días, se guarda en memoria y se rota: al renovar, el anterior deja de servir. Un JWT con `alg: none`, un token alterado o un refresh usado como access responden `401`.

### Historias nuevas

| ID | Historia | Estado |
| --- | --- | --- |
| HU-08 | Un administrador publica espacios | Hecho |
| HU-09 | Access token, refresh token y vencimiento | Hecho |
| HU-10 | Autorización por rol | Hecho |
| HU-11 | El dueño (o un ADMIN) es quien toca la reserva | Hecho |
| HU-12 | CORS, límite de login y entradas rechazadas | Hecho |

**HU-08.** Como administrador, quiero publicar una sala o un escritorio por la API. `POST /api/espacios` con rol `ADMIN` responde `201`. Un `USUARIO` recibe `403`. Sin token, `401`. Nombre repetido: `409`.

**HU-09.** Como usuario registrado, quiero un JWT de acceso corto y un refresh token para renovarlo. El login devuelve los dos. Si el access token ya venció, el perfil responde `401` (`token expirado`) y `POST /api/sesion/renovacion` entrega otro access token vigente. El refresh anterior queda invalidado.

**HU-10.** Como sistema, quiero separar identidad y permisos. El JWT declara el rol. Publicar espacios exige `ADMIN`. Elegir el rol en el registro responde `400` y la cuenta no se crea.

**HU-11.** Como usuario, quiero que otra persona no modifique mi reserva cambiando el id. `PATCH /api/reservas/:id` con una nota: el dueño recibe `200`, otro usuario `403`, un id inexistente `404`, y un `ADMIN` puede anotar la de cualquiera. `GET /api/usuarios/:id/reservas` sigue la misma regla. Cancelar la reserva de otro sigue en `403`, como en HU-05.

**HU-12.** Como operador, quiero que el login no acepte fuerza bruta, que el navegador solo hable con orígenes de la lista y que un operador `$gt` o un byte nulo no entren al sistema. Al superar 5 intentos de login, la respuesta es `429` aunque la contraseña sea la correcta. El refresh no comparte ese cupo. Un origen de la lista vuelve en `Access-Control-Allow-Origin` (nunca `*`). Un origen ajeno recibe `403`.

### Pruebas nuevas

Son 32 escenarios más. Junto con los 30 anteriores, la suite queda en 62 escenarios y 387 pasos.

| Archivo | Qué cubre |
| --- | --- |
| `features/renovacion-de-sesion.feature` | JWT, perfil sin token, token falso, algoritmo `none`, access vencido, renovación, rotación del refresh |
| `features/autorizacion-por-rol.feature` | Usuario bloqueado al publicar, admin habilitado, nombre duplicado y rol rechazado en el registro |
| `features/proteccion-de-recursos.feature` | Nota del dueño, IDOR de otro usuario, admin, reserva inexistente, listado ajeno y nota demasiado larga |
| `features/endurecimiento-del-servidor.feature` | Fuerza bruta, refresh durante el bloqueo, CORS, NoSQL, SQL, byte nulo, campo extra y capacidad no numérica |

### API nueva

| Método y ruta | Auth | Respuesta |
| --- | --- | --- |
| `POST /api/sesion` | no, con límite | Ahora también devuelve `refreshToken`. Sigue devolviendo `token` |
| `POST /api/sesion/renovacion` | refresh token | `{ "token", "refreshToken" }` nuevos. El refresh enviado queda revocado |
| `POST /api/espacios` | `ADMIN` | Espacio creado |
| `GET /api/usuarios/:id/reservas` | dueño o `ADMIN` | Reservas de esa persona. Otro usuario: `403` |
| `PATCH /api/reservas/:id` | dueño o `ADMIN` | Reserva con `nota`. Otro usuario: `403` |

El login y el perfil incluyen `rol`. La contraseña sigue sin salir en ninguna respuesta, y el JWT no la lleva adentro.

### Variables nuevas

| Variable | Defecto | Para qué |
| --- | --- | --- |
| `ACCESS_TOKEN_TTL_SECONDS` | `900` | Vida del access token |
| `REFRESH_TOKEN_TTL_SECONDS` | `604800` | Vida del refresh token |
| `LOGIN_MAX_INTENTOS` | `5` | Intentos de `POST /api/sesion` por IP |
| `LOGIN_VENTANA_MS` | `900000` | Ventana de ese límite (15 minutos) |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Orígenes permitidos. `*` hace fallar el arranque |

### Cómo mostrarlo con cURL

Las tres comprobaciones que pide la unidad también corren solas en Cucumber. Para verlas a mano, con el servidor en `http://localhost:3000` y un usuario ya registrado:

Fuerza bruta. El sexto `POST /api/sesion` desde la misma máquina responde `429`, aunque a la sexta uses la contraseña correcta:

```bash
curl -s -X POST http://localhost:3000/api/sesion \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"juan@correo.com\",\"contrasena\":\"incorrecta1\"}"
```

Vencimiento. El escenario `Un access token vencido se rechaza y el refresh emite otro vigente` emite el access token ya vencido, el perfil responde `401` (`token expirado`) y, después de devolverle los 15 minutos de vida, `POST /api/sesion/renovacion` entrega uno nuevo. A mano, con un refresh obtenido en el login:

```bash
curl -s -X POST http://localhost:3000/api/sesion/renovacion \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"EL-REFRESH\"}"
```

Recurso ajeno. Con el token de Ana y el id de una reserva de Juan:

```bash
curl -s -X PATCH http://localhost:3000/api/reservas/ID-DE-JUAN \
  -H "Authorization: Bearer TOKEN-DE-ANA" \
  -H "Content-Type: application/json" \
  -d "{\"nota\":\"hack\"}"
```

La respuesta es `403` y la nota de Juan no cambia.
