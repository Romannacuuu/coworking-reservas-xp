# Backlog del producto — Reservas de coworking

Sistema para que una persona se registre, mire qué salas y escritorios están libres en una fecha, reserve uno con sus créditos y cancele si ya no lo necesita.

Cada historia sigue el formato: **Como** rol, **quiero** acción, **para** beneficio. Una historia se considera terminada cuando pasan todos sus criterios de aceptación, automatizados en `features/`.

| ID | Historia | Prioridad | Estado |
| --- | --- | --- | --- |
| HU-01 | Registro de usuario | Alta | Hecho |
| HU-02 | Inicio de sesión | Alta | Hecho |
| HU-03 | Consulta de disponibilidad | Alta | Hecho |
| HU-04 | Reserva de espacio | Alta | Hecho |
| HU-05 | Cancelación de reserva | Alta | Hecho |
| HU-06 | Consulta de mis reservas | Alta | Hecho |
| HU-NF-01 | Contraseñas con bcrypt y sal | Alta | Hecho |
| HU-NF-02 | Consultas en menos de 200 ms | Media | Hecho |
| HU-07 | El catálogo sobrevive a un reinicio | Baja | Pendiente |
| HU-08 | Un administrador publica espacios por la API | Baja | Pendiente |

HU-07 y HU-08 están escritas para no perderlas. No se implementaron: ninguna historia de esta entrega pide que los datos sobrevivan a un reinicio ni un rol de administrador.

## HU-01 — Registro de usuario

**Como** visitante, **quiero** registrarme con nombre, email y contraseña, **para** poder acceder al sistema de reservas.

Criterios de aceptación:

- Con nombre, email y contraseña válidos, la cuenta se crea y la respuesta es `201`. El email vuelve en el cuerpo y la contraseña no aparece.
- La cuenta inicia con un saldo de bienvenida de 300 créditos, suficiente para reservar una sala estándar.
- Si el email ya está registrado, la respuesta es `409` con el mensaje `email ya registrado`. `Juan@Correo.com` y `juan@correo.com` cuentan como el mismo email.
- Si la contraseña tiene menos de 8 caracteres, la respuesta es `400`.
- Si el email está mal formado o el nombre está vacío, la respuesta es `400`.

Feature: `features/registro-de-usuario.feature`.

## HU-02 — Inicio de sesión

**Como** usuario registrado, **quiero** iniciar sesión con email y contraseña, **para** acceder a mis reservas.

Criterios de aceptación:

- Con credenciales válidas la respuesta es `200` e incluye un token. Con ese token se puede consultar `GET /api/reservas`.
- Con la contraseña incorrecta la respuesta es `401` y el mensaje es `credenciales inválidas`.
- Con un email que no existe la respuesta es el mismo `401`. El mensaje no revela si la cuenta existe.

Feature: `features/inicio-de-sesion.feature`.

## HU-03 — Consulta de disponibilidad

**Como** usuario autenticado, **quiero** ver qué espacios están libres en una fecha, **para** elegir dónde trabajar.

Criterios de aceptación:

- En una fecha sin reservas, cada espacio figura como `Disponible`.
- Un espacio con una reserva confirmada figura como `Ocupada` en esa fecha y sigue `Disponible` en otra fecha.
- Sin token la respuesta es `401` (`no autenticado`). Un token alterado también es `401` (`token inválido`).
- Si falta la fecha, o está mal escrita, la respuesta es `400`.

Feature: `features/consulta-de-disponibilidad.feature`.

## HU-04 — Reserva de espacio

**Como** usuario autenticado, **quiero** reservar un espacio disponible, **para** tener un lugar de trabajo.

Criterios de aceptación:

- Si el espacio está libre y el saldo alcanza, la reserva queda `confirmada`, se descuenta el precio del día y el espacio pasa a `Ocupada` en esa fecha.
- Si el espacio ya está ocupado, la respuesta es `409`. A quien intentó reservar no se le descuenta saldo.
- Si el saldo no alcanza, la respuesta es `400` (`saldo insuficiente`) y el saldo no cambia.
- Una fecha anterior a hoy, o una fecha imposible como `2026-02-31`, se rechaza con `400`.

Feature: `features/reserva-de-espacio.feature`.

## HU-05 — Cancelación de reserva

**Como** usuario autenticado, **quiero** cancelar una reserva propia, **para** liberar el espacio y recuperar el saldo.

Criterios de aceptación:

- Al cancelar, la reserva pasa a `cancelada`, el precio se reintegra al saldo y el espacio vuelve a `Disponible` en esa fecha.
- Otra persona recibe `403`. El saldo del dueño no se reintegra.
- Cancelar la misma reserva por segunda vez responde `409` (`la reserva ya está cancelada`).

Feature: `features/cancelacion-de-reserva.feature`.

## HU-06 — Consulta de mis reservas

**Como** usuario autenticado, **quiero** ver el listado de mis reservas, **para** organizar mi agenda.

Criterios de aceptación:

- El listado incluye solo las reservas de quien consulta.
- Si no tiene reservas, la respuesta es `200` y la lista está vacía.
- Sin token la respuesta es `401`.

Feature: `features/consulta-de-mis-reservas.feature`.

## HU-NF-01 — Contraseñas con bcrypt y sal

**Como** auditor de seguridad, **quiero** que todas las contraseñas se almacenen con hashing bcrypt y sal, **para** proteger los datos en caso de una brecha.

Criterios de aceptación:

- El valor guardado es distinto de la contraseña en texto plano.
- El valor guardado tiene formato de hash bcrypt (`$2a$`, `$2b$` o `$2y$`).
- Ese hash verifica la contraseña original.
- Dos cuentas con la misma contraseña obtienen hashes distintos, porque cada una lleva su propia sal.

Feature: `features/requisitos-no-funcionales.feature`.

## HU-NF-02 — Consultas en menos de 200 ms

**Como** administrador del sistema, **quiero** que los endpoints de consulta respondan en menos de 200 ms, **para** que mirar la disponibilidad se sienta inmediato.

Criterios de aceptación:

- `GET /api/salud` responde `200` en menos de 200 ms.
- `GET /api/espacios?fecha=...`, con un usuario autenticado, responde `200` en menos de 200 ms.

El alta de usuario queda fuera de este umbral: bcrypt consume CPU a propósito. El factor de costo se configura con `BCRYPT_ROUNDS` (por defecto 8 en este proyecto de prácticas).

Feature: `features/requisitos-no-funcionales.feature`.

## HU-07 — Persistencia entre reinicios (pendiente)

**Como** usuario, **quiero** que mi cuenta y mis reservas sigan existiendo después de reiniciar el servidor, **para** no perder la reserva al día siguiente.

No está implementada. Hoy el repositorio es en memoria. La interfaz `RepositorioUsuarios`, `RepositorioEspacios` y `RepositorioReservas` es el punto por donde entraría PostgreSQL más adelante, sin reescribir los servicios.

## HU-08 — Catálogo administrable (pendiente)

**Como** administrador, **quiero** publicar una sala o un escritorio por la API, **para** actualizar el local sin tocar el código.

No está implementada. Al levantar `npm run dev` el sistema siembra Sala A, Sala B y Escritorio 1. En las pruebas, el paso `Given que existe el espacio...` carga el catálogo llamando al servicio, porque crear espacios todavía no es una historia de usuario.
