# Reservas de coworking

Sistema para gestionar las reservas de un espacio de coworking. Una persona se registra, inicia sesión, mira qué salas y escritorios están libres en una fecha, reserva con sus créditos y puede cancelar para recuperar el saldo.

Backend en TypeScript y Express. Las historias están en [BACKLOG.md](BACKLOG.md).

## Ejecución

```bash
npm install
npm run dev
```

`http://localhost:3000` muestra la portada. La API está en `/api`. Al arrancar hay Sala A (100 créditos), Sala B (80) y Escritorio 1 (40). Cada cuenta empieza con 300 créditos.

## Pruebas

```bash
npm run test:e2e
```

Cucumber ejecuta los `.feature` contra la API. Resultado de la última corrida:

```text
30 scenarios (30 passed)
195 steps (195 passed)
```

| Archivo | Qué cubre |
| --- | --- |
| `features/registro-de-usuario.feature` | Alta de cuenta, email duplicado y contraseña corta |
| `features/inicio-de-sesion.feature` | Login correcto y credenciales inválidas |
| `features/consulta-de-disponibilidad.feature` | Salas libres, ocupadas y acceso sin token |
| `features/reserva-de-espacio.feature` | Reserva exitosa, sala ocupada, saldo insuficiente y fecha inválida |
| `features/cancelacion-de-reserva.feature` | Cancelar, reserva ajena y cancelar dos veces |
| `features/consulta-de-mis-reservas.feature` | Ver solo las reservas propias |
| `features/requisitos-no-funcionales.feature` | Contraseñas con bcrypt y respuestas en menos de 200 ms |

Los pasos están en `tests/step_definitions/`.

También forman parte de la verificación:

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run verificar` corre el linter, los tipos, la compilación y Cucumber.

## API

Las rutas con token piden `Authorization: Bearer <token>`. El campo de la contraseña es `contrasena`.

| Método y ruta | Auth |
| --- | --- |
| `GET /api/salud` | no |
| `POST /api/usuarios` | no |
| `POST /api/sesion` | no |
| `GET /api/usuarios/yo` | token |
| `GET /api/espacios?fecha=2026-10-15` | token |
| `POST /api/reservas` | token |
| `GET /api/reservas` | token |
| `POST /api/reservas/:id/cancelacion` | token |
