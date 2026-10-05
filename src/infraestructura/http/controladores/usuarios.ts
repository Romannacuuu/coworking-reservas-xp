import { Router } from 'express';
import { ServicioUsuarios } from '../../../aplicacion/servicios/servicioUsuarios';
import { ErrorDeAplicacion } from '../../../dominio/errores';
import { adaptar, exigirCampos, exigirTexto } from '../http';
import { requerirAuth, usuarioAutenticado } from '../autenticacion';
import { EmisorDeTokens } from '../../../aplicacion/puertos';

export function rutasUsuarios(usuarios: ServicioUsuarios, tokens: EmisorDeTokens): Router {
  const router = Router();

  router.post(
    '/usuarios',
    adaptar(async (req, res) => {
      if (declaraRol(req.body)) {
        throw new ErrorDeAplicacion('no se puede asignar un rol al registrarse', 400);
      }
      const cuerpo = exigirCampos(req.body, ['nombre', 'email', 'contrasena']);
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

function declaraRol(cuerpo: unknown): boolean {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    return false;
  }
  return 'rol' in cuerpo || 'role' in cuerpo;
}
