import { Router } from 'express';
import { ServicioAuth } from '../../../aplicacion/servicios/servicioAuth';
import { adaptar, exigirCampos, exigirTexto } from '../http';
import { limitadorDeIntentos } from '../limitador';

export function rutasSesion(
  auth: ServicioAuth,
  limite: { ventanaMs: number; maximo: number },
): Router {
  const router = Router();

  router.post(
    '/sesion',
    limitadorDeIntentos(limite),
    adaptar(async (req, res) => {
      const cuerpo = exigirCampos(req.body, ['email', 'contrasena']);
      const sesion = await auth.iniciarSesion(
        exigirTexto(cuerpo.email, 'email'),
        exigirTexto(cuerpo.contrasena, 'contraseña'),
      );
      res.status(200).json(sesion);
    }),
  );

  router.post(
    '/sesion/renovacion',
    adaptar(async (req, res) => {
      const cuerpo = exigirCampos(req.body, ['refreshToken']);
      const sesion = auth.renovar(exigirTexto(cuerpo.refreshToken, 'refreshToken'));
      res.status(200).json(sesion);
    }),
  );

  return router;
}
