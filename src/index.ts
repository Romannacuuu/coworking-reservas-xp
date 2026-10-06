import { crearAplicacion } from './composicion/crearAplicacion';

const puerto = Number(process.env.PORT ?? 3000);
const { app, servicios } = crearAplicacion({ sembrarCatalogo: true });

void servicios.usuarios
  .registrar({ nombre: 'Ana', email: 'ana@correo.com', contrasena: 'clave1234' })
  .then(() => escuchar())
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });

function escuchar(): void {
  const servidor = app.listen(puerto, '0.0.0.0', () => {
    console.log(`API de reservas escuchando en http://localhost:${puerto}`);
  });

  servidor.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`El puerto ${puerto} ya está en uso. Cerrá ese proceso o levantá la API con otro PORT.`);
    } else {
      console.error(error);
    }
    process.exit(1);
  });
}
