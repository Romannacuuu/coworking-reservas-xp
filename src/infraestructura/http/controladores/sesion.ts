import { Router } from 'express';
import { ServicioAuth } from '../../../aplicacion/servicios/servicioAuth';
import { adaptar, exigirTexto } from '../http';

export function rutasSesion(auth: ServicioAuth): Router {
  const router = Router();

  router.post(
    '/sesion',
    adaptar(async (req, res) => {
      const cuerpo = req.body as { email?: unknown; contrasena?: unknown };
      const sesion = await auth.iniciarSesion(
        exigirTexto(cuerpo.email, 'email'),
        exigirTexto(cuerpo.contrasena, 'contraseña'),
      );
      res.status(200).json(sesion);
    }),
  );

  return router;
}
