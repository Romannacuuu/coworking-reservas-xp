import { Router } from 'express';
import { ServicioReservas } from '../../../aplicacion/servicios/servicioReservas';
import { EmisorDeTokens } from '../../../aplicacion/puertos';
import { adaptar, exigirTexto } from '../http';
import { requerirAuth, usuarioAutenticado } from '../autenticacion';

export function rutasReservas(reservas: ServicioReservas, tokens: EmisorDeTokens): Router {
  const router = Router();
  const proteger = requerirAuth(tokens);

  router.post(
    '/reservas',
    proteger,
    adaptar(async (req, res) => {
      const cuerpo = req.body as { espacio?: unknown; fecha?: unknown };
      const reserva = reservas.reservar({
        usuarioId: usuarioAutenticado(req),
        espacio: exigirTexto(cuerpo.espacio, 'espacio'),
        fecha: exigirTexto(cuerpo.fecha, 'fecha'),
      });
      res.status(201).json(reserva);
    }),
  );

  router.post(
    '/reservas/:id/cancelacion',
    proteger,
    adaptar(async (req, res) => {
      const reserva = reservas.cancelar(usuarioAutenticado(req), req.params.id);
      res.status(200).json(reserva);
    }),
  );

  router.get(
    '/reservas',
    proteger,
    adaptar(async (req, res) => {
      res.status(200).json(reservas.listarPropias(usuarioAutenticado(req)));
    }),
  );

  return router;
}
