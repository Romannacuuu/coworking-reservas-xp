export function htmlDeInicio(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reservas de coworking</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: Georgia, serif; margin: 0; background: #f4f1ea; color: #1c1915; }
    main { max-width: 40rem; margin: 0 auto; padding: 3rem 1.25rem; }
    h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    p { line-height: 1.5; }
    code { font-family: Consolas, monospace; font-size: 0.95rem; }
    a { color: #0f3d32; }
    ul { padding-left: 1.2rem; }
    li { margin: 0.35rem 0; }
    .estado { font-family: Consolas, monospace; }
  </style>
</head>
<body>
  <main>
    <h1>API de reservas</h1>
    <p>El servidor está en marcha. Esta dirección es la portada. Las operaciones viven bajo <code>/api</code>.</p>
    <p>Estado de <a href="/api/salud"><code>/api/salud</code></a>: <strong class="estado" id="estado">comprobando…</strong></p>
    <h2>Rutas</h2>
    <ul>
      <li><code>POST /api/usuarios</code> — registro</li>
      <li><code>POST /api/sesion</code> — inicio de sesión</li>
      <li><code>POST /api/sesion/renovacion</code> — renovar el access token</li>
      <li><code>GET /api/usuarios/yo</code> — perfil y saldo</li>
      <li><code>GET /api/espacios?fecha=2026-10-15</code> — disponibilidad</li>
      <li><code>POST /api/espacios</code> — publicar un espacio (solo ADMIN)</li>
      <li><code>POST /api/reservas</code> — reservar</li>
      <li><code>GET /api/reservas</code> — mis reservas</li>
      <li><code>GET /api/usuarios/:id/reservas</code> — reservas de una persona (dueño o ADMIN)</li>
      <li><code>PATCH /api/reservas/:id</code> — anotar una reserva (dueño o ADMIN)</li>
      <li><code>POST /api/reservas/:id/cancelacion</code> — cancelar</li>
    </ul>
    <p>Al arrancar hay tres espacios: Sala A (100), Sala B (80) y Escritorio 1 (40). Una cuenta nueva empieza con 300 créditos.</p>
  </main>
  <script>
    fetch('/api/salud')
      .then(function (respuesta) { return respuesta.json(); })
      .then(function (cuerpo) {
        document.getElementById('estado').textContent = cuerpo.estado || 'sin estado';
      })
      .catch(function () {
        document.getElementById('estado').textContent = 'sin respuesta';
      });
  </script>
</body>
</html>`;
}
