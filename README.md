# Reservas de coworking

Backend para reservar salas y escritorios. Está hecho en TypeScript con Express, y las historias de usuario se comprueban con Cucumber.

Las historias y sus criterios de aceptación están en [BACKLOG.md](BACKLOG.md).

## Tecnologías

- Node.js y Express
- TypeScript en modo estricto
- Cucumber para las pruebas de comportamiento
- bcrypt para las contraseñas y un token firmado con HMAC
- Repositorio en memoria
- GitHub Actions para lint, compilación y pruebas

## Cómo ejecutarlo

Hace falta Node.js 20 o superior.

```bash
npm install
npm run dev
```

La portada queda en `http://localhost:3000`. La API está bajo `/api`. Al arrancar hay tres espacios: Sala A (100 créditos), Sala B (80) y Escritorio 1 (40). Cada cuenta nueva empieza con 300 créditos.

Variables opcionales: `PORT` (3000), `TOKEN_SECRET` y `BCRYPT_ROUNDS` (8).

Para la versión compilada:

```bash
npm run build
npm start
```

## Pruebas

```bash
npm run test:e2e
npm run lint
npm run typecheck
npm run build
```

`npm run verificar` corre las cuatro. Cucumber no necesita el servidor levantado: llama a la API dentro del proceso. La última corrida dio 30 escenarios y 195 pasos en verde.

## API

El cuerpo usa el campo `contrasena`. Las rutas marcadas con token piden `Authorization: Bearer <token>`.

| Método y ruta | Auth | Qué hace |
| --- | --- | --- |
| `GET /api/salud` | no | Estado del servidor |
| `POST /api/usuarios` | no | Registro. Devuelve el usuario, sin la contraseña |
| `POST /api/sesion` | no | Login. Devuelve un token |
| `GET /api/usuarios/yo` | token | Perfil y saldo |
| `GET /api/espacios?fecha=2026-10-15` | token | Disponibilidad de ese día |
| `POST /api/reservas` | token | Reserva un espacio |
| `GET /api/reservas` | token | Reservas de esa persona |
| `POST /api/reservas/:id/cancelacion` | token | Cancela y devuelve el crédito |

Ejemplo de reserva, después de registrarse e iniciar sesión:

```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"espacio\":\"Sala A\",\"fecha\":\"2026-10-15\"}"
```

La Sala A cuesta 100. El saldo pasa de 300 a 200 y ese día la sala figura `Ocupada`. Al cancelar, el saldo vuelve a 300 y la sala queda `Disponible`. Los datos se borran al frenar el servidor.

## Decisiones de XP

1. **BDD.** Cada historia funcional tiene un `.feature` con un camino feliz y al menos un caso de error. Los pasos están en `tests/step_definitions/`.
2. **Diseño simple.** Express y memoria alcanzan para las historias de esta entrega. Persistencia entre reinicios y un alta de espacios por API quedaron como HU-07 y HU-08 en el backlog.
3. **Capas.** Los controladores traducen HTTP. Los servicios aplican las reglas. Los repositorios guardan datos. El estado `Disponible` u `Ocupada` se calcula por fecha, no se guarda en la sala.
4. **Integración continua.** `.github/workflows/main.yml` corre linter, `tsc` y Cucumber en cada push.

## Ciclo de una historia

La reserva de la Sala A se escribió primero como escenario:

```gherkin
Scenario: Reserva exitosa de un espacio disponible
  Given que existe el espacio "Sala A" de tipo "sala" con capacidad 6 y precio 100
  When "Juan" reserva el espacio "Sala A" para el "2026-10-15"
  Then la respuesta tiene código 201
  And la reserva queda en estado "confirmada"
  And el saldo de "Juan" es 200
```

Sin la ruta, ese `Then` falla con 404. Esa es la fase roja. El verde es `ServicioReservas.reservar`: valida la fecha, rechaza si la sala está ocupada o si el saldo no alcanza, y recién ahí descuenta y confirma. Después se extrajo `hayReservaConfirmada` para que la misma regla sirva al reservar, al consultar y al cancelar, sin cambiar el resultado de las pruebas.
