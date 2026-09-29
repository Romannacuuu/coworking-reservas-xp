import { Router } from 'express';
import { ServicioEspacios } from '../../../aplicacion/servicios/servicioEspacios';
import { EmisorDeTokens } from '../../../aplicacion/puertos';
import { ErrorDeAplicacion } from '../../../dominio/errores';
import { adaptar } from '../http';
import { requerirAuth } from '../autenticacion';

export function rutasEspacios(espacios: ServicioEspacios, tokens: EmisorDeTokens): Router {
  const router = Router();

  router.get(
    '/espacios',
    requerirAuth(tokens),
    adaptar(async (req, res) => {
      const fecha = req.query.fecha;
      if (typeof fecha !== 'string' || fecha.trim() === '') {
        throw new ErrorDeAplicacion('la fecha es obligatoria', 400);
      }
      res.status(200).json(espacios.disponibilidad(fecha));
    }),
  );

  return router;
}
