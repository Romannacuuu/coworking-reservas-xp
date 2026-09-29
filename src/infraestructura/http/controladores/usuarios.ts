import { Router } from 'express';
import { ServicioUsuarios } from '../../../aplicacion/servicios/servicioUsuarios';
import { adaptar, exigirTexto } from '../http';
import { requerirAuth, usuarioAutenticado } from '../autenticacion';
import { EmisorDeTokens } from '../../../aplicacion/puertos';

export function rutasUsuarios(usuarios: ServicioUsuarios, tokens: EmisorDeTokens): Router {
  const router = Router();

  router.post(
    '/usuarios',
    adaptar(async (req, res) => {
      const cuerpo = req.body as { nombre?: unknown; email?: unknown; contrasena?: unknown };
      const creado = await usuarios.registrar({
        nombre: exigirTexto(cuerpo.nombre, 'nombre'),
        email: exigirTexto(cuerpo.email, 'email'),
        contrasena: exigirTexto(cuerpo.contrasena, 'contraseña'),
      });
      res.status(201).json(creado);
    }),
  );

  router.get(
    '/usuarios/yo',
    requerirAuth(tokens),
    adaptar(async (req, res) => {
      res.status(200).json(usuarios.perfil(usuarioAutenticado(req)));
    }),
  );

  return router;
}
