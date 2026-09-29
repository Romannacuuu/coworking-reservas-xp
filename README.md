# Reservas de coworking

Sistema para gestionar las reservas de un espacio de coworking. Una persona se registra, inicia sesión, mira qué salas y escritorios están libres en una fecha, reserva con sus créditos y puede cancelar para recuperar el saldo.

Backend en TypeScript (modo estricto) y Express. Las pruebas de comportamiento están en Cucumber. Los datos viven en memoria.

## Cómo ejecutarlo

Hace falta Node.js 20 o superior.

```bash
npm install
npm run dev
```

`http://localhost:3000` muestra la portada. La API está en `/api`.

Al arrancar hay tres espacios: Sala A (100 créditos), Sala B (80) y Escritorio 1 (40). Cada cuenta nueva empieza con 300 créditos.

```bash
npm run build
npm start
```

Variables opcionales: `PORT` (3000), `TOKEN_SECRET` y `BCRYPT_ROUNDS` (8).

## Historias

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
| HU-08 | Publicar espacios por la API | Pendiente |

**HU-01.** Como visitante, quiero registrarme con nombre, email y contraseña para acceder al sistema. La cuenta responde `201`, no devuelve la contraseña y empieza con 300 créditos. Email repetido: `409`. Contraseña corta, email inválido o nombre vacío: `400`.

**HU-02.** Como usuario registrado, quiero iniciar sesión para acceder a mis reservas. Credenciales válidas: `200` y un token. Contraseña incorrecta o email inexistente: `401` con el mismo mensaje, `credenciales inválidas`.

**HU-03.** Como usuario autenticado, quiero ver qué espacios están libres en una fecha para elegir dónde trabajar. Sin reservas figuran `Disponible`. Con reserva confirmada, `Ocupada` solo ese día. Sin token o con token alterado: `401`. Fecha ausente o mal escrita: `400`.

**HU-04.** Como usuario autenticado, quiero reservar un espacio disponible para tener un lugar de trabajo. Si hay lugar y saldo, la reserva queda `confirmada`, se descuenta el precio y el espacio pasa a `Ocupada`. Si está ocupado: `409` y no se cobra. Si no alcanza el saldo: `400` y el saldo no cambia. Fecha pasada o imposible: `400`.

**HU-05.** Como usuario autenticado, quiero cancelar una reserva propia para liberar el espacio y recuperar el saldo. Pasa a `cancelada`, se reintegra el precio y el espacio vuelve a `Disponible`. Otra persona recibe `403`. Cancelar dos veces: `409`.

**HU-06.** Como usuario autenticado, quiero ver mis reservas para organizar mi agenda. Solo aparecen las propias. Sin reservas, la lista va vacía con `200`. Sin token: `401`.

**HU-NF-01.** Como auditor de seguridad, quiero las contraseñas guardadas con bcrypt y sal. El valor almacenado no es el texto plano, tiene formato bcrypt, verifica la clave original y dos cuentas con la misma contraseña no comparten el hash.

**HU-NF-02.** Como administrador, quiero que las consultas respondan en menos de 200 ms. Lo cumplen `GET /api/salud` y `GET /api/espacios`. El registro queda fuera de ese umbral porque bcrypt consume CPU a propósito.

**HU-07 y HU-08** quedan escritas y sin implementar. Hoy los datos se borran al frenar el servidor, y el catálogo de salas se siembra al arrancar.

## Pruebas

```bash
npm run test:e2e
```

Cucumber ejecuta cada `.feature` contra la API, sin levantar el servidor. Última corrida:

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

Los pasos están en `tests/step_definitions/`. Cada escenario arma una aplicación nueva, así que uno no deja datos al siguiente.

Verificación completa, la misma que corre GitHub Actions:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

`npm run verificar` ejecuta las cuatro.

## API

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
| `POST /api/reservas/:id/cancelacion` | token | Reserva `cancelada` y saldo reintegrado |

Reservar la Sala A descuenta 100 créditos (de 300 a 200) y ese día figura `Ocupada`. Cancelarla devuelve el crédito y la sala queda `Disponible`.

## Diseño

Controladores en `src/infraestructura/http`: traducen HTTP. Servicios en `src/aplicacion`: aplican las reglas. Repositorios en `src/infraestructura/persistencia`: guardan en memoria. El estado de una sala se calcula para la fecha pedida. Las contraseñas se hashean con bcrypt. El pipeline está en `.github/workflows/main.yml` y corre linter, tipos, compilación y Cucumber en cada push.
